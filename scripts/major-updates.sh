#!/usr/bin/env bash
#
# メジャー差のある依存を検出し、追跡 issue を作成・更新する（issue #189 / docs/06）。
#
# Dependabot はメジャー更新を一律で ignore している（.github/dependabot.yml）。そのままでは
# メジャー更新に誰も気づかないため、週次のワークフロー（major-updates.yml）からこれを呼び、
# 追跡 issue 1 本に一覧を出す。issue 本文の書き換えは通知されないので、新しいメジャーが
# 出た週だけコメントを付けて通知する。
#
# 使い方（リポジトリのルートで実行）:
#   scripts/major-updates.sh sync               pnpm outdated を実行し、追跡 issue を更新する（gh と GH_TOKEN が必要）
#   scripts/major-updates.sh detect <json>      pnpm outdated --format json の出力から、メジャー差のある依存を JSON 配列で出す
#   scripts/major-updates.sh render <json>      detect の出力から issue 本文を出す
#   scripts/major-updates.sh new <prev> <cur>   cur のうち、prev に無い（依存, 最新メジャー）の組を出す
#   scripts/major-updates.sh state <body>       issue 本文に埋め込んだ前回の検出結果を取り出す
#
# detect / render / new / state は通信せず、渡されたファイルを読むだけ（scripts/major-updates.test.sh で検証）。
# 終了コード: 0 = 成功 / 2 = pnpm outdated の出力が読めない / その他 = gh 等の失敗
set -Eeuo pipefail

readonly TITLE='chore(deps): メジャー更新の追跡（自動更新）'
readonly LABEL='dependencies'
# 前回の検出結果を issue 本文に 1 行の JSON で埋め込み、次の実行で「新しく出たもの」を判定する。
# 本文の表から読み戻すと、表の体裁を変えたときに判定が壊れるため、機械向けの行を別に持つ。
readonly STATE_PREFIX='<!-- major-updates-state: '
readonly STATE_SUFFIX=' -->'

# メジャー差のある依存を、名前順の JSON 配列で出す。
#
# - メジャーは先頭の数字だけで比べる。0.x のマイナー更新（0.23 → 0.24）は対象にしない。
#   Dependabot も 0.x のマイナーを minor-and-patch グループで上げており、扱いを揃えるため。
# - latest が current より小さいもの（canary 等を入れている場合）は対象にしない。
# - current が無い（未インストール）ときは wanted で代える。数字で始まらない版（link: 等）は飛ばす。
detect() {
    local file="$1"
    if ! jq -e 'type == "object"' "$file" >/dev/null 2>&1; then
        echo "pnpm outdated の出力が JSON オブジェクトとして読めない: ${file}" >&2
        return 2
    fi
    jq -c '
        def major: [capture("^(?<m>[0-9]+)\\.") | .m | tonumber][0];
        [ to_entries[]
          | { name: .key,
              current: (.value.current // .value.wanted),
              latest: .value.latest,
              type: .value.dependencyType }
          | select((.current | type) == "string" and (.latest | type) == "string")
          | select((.current | major) as $c | (.latest | major) as $l
                   | $c != null and $l != null and $l > $c)
        ] | sort_by(.name)' "$file"
}

render() {
    local file="$1"
    cat <<'EOF'
## メジャー更新の一覧

この issue は `.github/workflows/major-updates.yml` が毎週更新する（手で編集しても次の実行で上書きされる）。
Dependabot はメジャー更新を自動 PR にしないため（docs/06 §「メジャー更新は自動 PR の対象外とする」）、ここで拾う。

EOF
    if [ "$(jq 'length' "$file")" -eq 0 ]; then
        echo 'メジャー差のある依存は無い。'
    else
        echo '| 依存 | 現在 | 最新 | 種別 |'
        echo '|---|---|---|---|'
        jq -r '.[] | "| `\(.name)` | \(.current) | \(.latest) | \(
            if .type == "dependencies" then "本番"
            elif .type == "devDependencies" then "開発"
            else .type end) |"' "$file"
    fi
    cat <<'EOF'

上げると決めたものは、依存ごとに専用の issue を起票して作業する（この issue のサブ issue にしてよい）。
破壊的変更・成果物への影響など、確認すべき点はその issue に残す。
EOF
    echo
    printf '%s%s%s\n' "$STATE_PREFIX" "$(jq -c '[.[] | {name, latest}]' "$file")" "$STATE_SUFFIX"
}

# 前回に無かった（依存, 最新メジャー）の組を出す。typescript 6 → 7 のように、
# 同じ依存でも最新のメジャーが進んだら新しいものとして扱う。
new_entries() {
    local prev="$1" cur="$2"
    jq -n -c --slurpfile p "$prev" --slurpfile c "$cur" '
        def key: "\(.name)@\(.latest | split(".")[0])";
        ($p[0] | map(key)) as $known
        | [ $c[0][] | select(key as $k | $known | any(. == $k) | not) ]'
}

# issue 本文から前回の検出結果を取り出す。埋め込み行が無い・壊れているときは [] を返す。
# 空として扱うと全件を「新しい」と判定して通知が増えるが、黙って通知が止まるよりは安全。
state() {
    local file="$1" line json
    line=$(grep -F -- "$STATE_PREFIX" "$file" | tail -n 1 || true)
    json="${line#"$STATE_PREFIX"}"
    json="${json%"$STATE_SUFFIX"}"
    if [ -n "$line" ] && printf '%s' "$json" | jq -e 'type == "array"' >/dev/null 2>&1; then
        printf '%s\n' "$json" | jq -c '.'
    else
        [ -z "$line" ] || echo "前回の検出結果が読めないため、空として扱う" >&2
        echo '[]'
    fi
}

sync() {
    local work issue
    work=$(mktemp -d)
    # shellcheck disable=SC2064 # work は今ここで確定させたい（関数を抜けた後も同じパスを消す）
    trap "rm -rf '${work}'" EXIT

    # pnpm outdated は古い依存が 1 つでもあると終了コード 1 を返すため、終了コードでは成否を判定しない。
    # 出力が JSON として読めるか（detect）で判定する。
    pnpm outdated --format json >"${work}/outdated.json" || true
    detect "${work}/outdated.json" >"${work}/current.json"
    render "${work}/current.json" >"${work}/body.md"

    issue=$(gh issue list --label "$LABEL" --state open --limit 200 --json number,title \
        | jq -r --arg t "$TITLE" '[.[] | select(.title == $t)][0].number // empty')

    if [ -z "$issue" ]; then
        if [ "$(jq 'length' "${work}/current.json")" -eq 0 ]; then
            echo "メジャー差のある依存は無く、追跡 issue も無い。何もしない"
            return 0
        fi
        # 作成そのものが通知になるため、コメントは付けない
        gh issue create --title "$TITLE" --label "$LABEL" --body-file "${work}/body.md"
        return 0
    fi

    gh issue view "$issue" --json body --jq .body >"${work}/prev_body.md"
    state "${work}/prev_body.md" >"${work}/prev.json"
    new_entries "${work}/prev.json" "${work}/current.json" >"${work}/new.json"

    if ! diff -q "${work}/prev_body.md" "${work}/body.md" >/dev/null; then
        gh issue edit "$issue" --body-file "${work}/body.md" >/dev/null
        echo "#${issue} の本文を更新した"
    fi

    if [ "$(jq 'length' "${work}/new.json")" -gt 0 ]; then
        {
            echo '新しいメジャー更新が出た。'
            echo
            jq -r '.[] | "- `\(.name)` \(.current) → \(.latest)"' "${work}/new.json"
        } >"${work}/comment.md"
        gh issue comment "$issue" --body-file "${work}/comment.md" >/dev/null
        echo "#${issue} に新しいメジャー更新 $(jq 'length' "${work}/new.json") 件をコメントした"
    fi
}

main() {
    local cmd="${1:-}"
    case "$cmd" in
        sync) sync ;;
        detect) detect "${2:?pnpm outdated の JSON ファイルを指定する}" ;;
        render) render "${2:?detect の出力ファイルを指定する}" ;;
        new) new_entries "${2:?前回の検出結果を指定する}" "${3:?今回の検出結果を指定する}" ;;
        state) state "${2:?issue 本文のファイルを指定する}" ;;
        *)
            echo "使い方: $0 {sync|detect <json>|render <json>|new <prev> <cur>|state <body>}" >&2
            return 64
            ;;
    esac
}

main "$@"
