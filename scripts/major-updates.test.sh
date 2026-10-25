#!/usr/bin/env bash
#
# scripts/major-updates.sh の通信しない部分（detect / render / new / state）を検証する（issue #189）。
#
# 判定が壊れると、追跡 issue は「メジャー差のある依存は無い」のまま更新され続け、誰も気づけない。
# そのため週次の実行（major-updates.yml）でも、本番の同期の前にこのテストを走らせる。
#
# 使い方: scripts/major-updates.test.sh   （リポジトリのルートで実行）
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
readonly ROOT
readonly SUT="${ROOT}/scripts/major-updates.sh"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

failures=0
passes=0

pass() {
    passes=$((passes + 1))
}

fail() {
    echo "FAIL: $1"
    failures=$((failures + 1))
}

# actual と expected を、JSON として正規化してから比べる（空白・キー順の違いで落とさない）
expect_json() {
    local name="$1" actual="$2" expected="$3"
    if [ "$(printf '%s' "$actual" | jq -cS '.' 2>/dev/null)" = "$(printf '%s' "$expected" | jq -cS '.')" ]; then
        pass
    else
        fail "${name}: 期待 ${expected} / 実際 ${actual}"
    fi
}

# pnpm outdated --format json の 1 件分を作る
outdated_entry() {
    local name="$1" current="$2" latest="$3" type="${4:-devDependencies}"
    printf '"%s": {"current": "%s", "latest": "%s", "wanted": "%s", "isDeprecated": false, "dependencyType": "%s"}' \
        "$name" "$current" "$latest" "$current" "$type"
}

# --- detect: 正常系 ---

cat >"${work}/outdated.json" <<EOF
{
  $(outdated_entry typescript 5.5.2 7.0.2),
  $(outdated_entry next 15.5.28 16.4.3 dependencies),
  $(outdated_entry prettier 3.9.9 3.9.10)
}
EOF
expect_json "メジャー差だけを名前順に出す" \
    "$(bash "$SUT" detect "${work}/outdated.json")" \
    '[{"name":"next","current":"15.5.28","latest":"16.4.3","type":"dependencies"},
      {"name":"typescript","current":"5.5.2","latest":"7.0.2","type":"devDependencies"}]'

# --- detect: 準正常系 ---

cat >"${work}/outdated.json" <<EOF
{
  $(outdated_entry react-hook-form 7.90.0 7.91.0),
  $(outdated_entry eslint-config-next 16.4.2 16.4.3)
}
EOF
expect_json "マイナー・パッチは出さない" "$(bash "$SUT" detect "${work}/outdated.json")" '[]'

cat >"${work}/outdated.json" <<EOF
{
  $(outdated_entry markdownlint-cli2 0.23.3 0.24.0),
  $(outdated_entry some-lib 0.9.1 1.0.0)
}
EOF
expect_json "0.x のマイナーは出さず、0.x → 1.0 は出す" \
    "$(bash "$SUT" detect "${work}/outdated.json")" \
    '[{"name":"some-lib","current":"0.9.1","latest":"1.0.0","type":"devDependencies"}]'

cat >"${work}/outdated.json" <<EOF
{
  $(outdated_entry canary-lib 16.0.0-canary.1 15.5.28)
}
EOF
expect_json "latest が current より古いものは出さない" "$(bash "$SUT" detect "${work}/outdated.json")" '[]'

cat >"${work}/outdated.json" <<'EOF'
{
  "not-installed": {"wanted": "1.2.0", "latest": "2.0.0", "dependencyType": "dependencies"},
  "linked": {"current": "link:../linked", "latest": "3.0.0", "dependencyType": "dependencies"}
}
EOF
expect_json "current が無ければ wanted で比べ、数字で始まらない版は飛ばす" \
    "$(bash "$SUT" detect "${work}/outdated.json")" \
    '[{"name":"not-installed","current":"1.2.0","latest":"2.0.0","type":"dependencies"}]'

echo '{}' >"${work}/outdated.json"
expect_json "古い依存が無ければ空配列" "$(bash "$SUT" detect "${work}/outdated.json")" '[]'

# --- detect: 異常系 ---

for bad in 'ERR_PNPM_OUTDATED something went wrong' '[]' ''; do
    printf '%s' "$bad" >"${work}/outdated.json"
    rc=0
    bash "$SUT" detect "${work}/outdated.json" >/dev/null 2>&1 || rc=$?
    if [ "$rc" -eq 2 ]; then
        pass
    else
        fail "JSON オブジェクトでない出力（'${bad}'）は終了コード 2 で落ちるべき: 実際 ${rc}"
    fi
done

# --- render / state ---

cat >"${work}/current.json" <<'EOF'
[{"name":"next","current":"15.5.28","latest":"16.4.3","type":"dependencies"},
 {"name":"typescript","current":"5.5.2","latest":"7.0.2","type":"devDependencies"}]
EOF
bash "$SUT" render "${work}/current.json" >"${work}/body.md"

# shellcheck disable=SC2016 # バッククォートは Markdown のコード表記で、コマンド置換ではない
if grep -qxF '| `next` | 15.5.28 | 16.4.3 | 本番 |' "${work}/body.md" \
    && grep -qxF '| `typescript` | 5.5.2 | 7.0.2 | 開発 |' "${work}/body.md"; then
    pass
else
    fail "本文の表に依存の行が出るべき"
fi

expect_json "本文に埋め込んだ検出結果を読み戻せる" \
    "$(bash "$SUT" state "${work}/body.md")" \
    '[{"name":"next","latest":"16.4.3"},{"name":"typescript","latest":"7.0.2"}]'

echo '[]' >"${work}/empty.json"
bash "$SUT" render "${work}/empty.json" >"${work}/empty_body.md"
if grep -qF 'メジャー差のある依存は無い。' "${work}/empty_body.md" && ! grep -qF '| 依存 |' "${work}/empty_body.md"; then
    pass
else
    fail "0 件のときは表を出さず「無い」と書くべき"
fi

printf '手で書き換えられた本文\n' >"${work}/no_state.md"
expect_json "埋め込み行が無い本文は空として扱う" "$(bash "$SUT" state "${work}/no_state.md" 2>/dev/null)" '[]'

printf 'x\n<!-- major-updates-state: [{"name": -->\n' >"${work}/broken_state.md"
expect_json "壊れた埋め込み行は空として扱う" "$(bash "$SUT" state "${work}/broken_state.md" 2>/dev/null)" '[]'

# --- new ---

echo '[{"name":"next","latest":"16.4.3"},{"name":"typescript","latest":"6.0.3"}]' >"${work}/prev.json"
cat >"${work}/cur.json" <<'EOF'
[{"name":"msw","current":"2.15.0","latest":"3.0.3","type":"devDependencies"},
 {"name":"next","current":"15.5.28","latest":"16.5.0","type":"dependencies"},
 {"name":"typescript","current":"5.5.2","latest":"7.0.2","type":"devDependencies"}]
EOF
expect_json "新しい依存と、最新メジャーが進んだ依存だけを出す（同じメジャー内の更新は出さない）" \
    "$(bash "$SUT" new "${work}/prev.json" "${work}/cur.json")" \
    '[{"name":"msw","current":"2.15.0","latest":"3.0.3","type":"devDependencies"},
      {"name":"typescript","current":"5.5.2","latest":"7.0.2","type":"devDependencies"}]'

expect_json "前回と同じなら何も出さない" \
    "$(bash "$SUT" new "${work}/cur.json" "${work}/cur.json")" '[]'

# --- sync ---
#
# 外部 I/O の gh / pnpm だけを偽物に差し替え、PATH の先頭に置く。偽物は受けた操作を
# calls.log に 1 行ずつ残し、issue の本文・コメントはファイルに書き出す。
# 返す内容は FAKE_* の環境変数で指したファイルから読む。

fake_bin="${work}/bin"
mkdir -p "$fake_bin"

cat >"${fake_bin}/pnpm" <<'EOF'
#!/usr/bin/env bash
# 本物の pnpm outdated と同じく、古い依存があれば終了コード 1 を返す
cat "$FAKE_OUTDATED"
exit 1
EOF

cat >"${fake_bin}/gh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
body_file() {
    while [ "$#" -gt 0 ]; do
        [ "$1" = "--body-file" ] && { echo "$2"; return; }
        shift
    done
}
case "$1 $2" in
    "issue list") cat "$FAKE_ISSUES" ;;
    "issue view") cat "$FAKE_BODY" ;;
    "issue create") echo "create" >>"$FAKE_LOG"; cp "$(body_file "$@")" "${FAKE_OUT}/created.md" ;;
    "issue edit") echo "edit $3" >>"$FAKE_LOG"; cp "$(body_file "$@")" "${FAKE_OUT}/edited.md" ;;
    "issue comment") echo "comment $3" >>"$FAKE_LOG"; cp "$(body_file "$@")" "${FAKE_OUT}/comment.md" ;;
    *) echo "unexpected gh call: $*" >&2; exit 99 ;;
esac
EOF
chmod +x "${fake_bin}/pnpm" "${fake_bin}/gh"

readonly TRACKER_TITLE='chore(deps): メジャー更新の追跡（自動更新）'

# 偽物の入出力を毎回まっさらにして sync を走らせる。終了コードを sync_rc に残す。
run_sync() {
    rm -rf "${work}/out"
    mkdir -p "${work}/out"
    : >"${work}/out/calls.log"
    sync_rc=0
    PATH="${fake_bin}:${PATH}" \
        FAKE_OUTDATED="${work}/sync_outdated.json" \
        FAKE_ISSUES="${work}/sync_issues.json" \
        FAKE_BODY="${work}/sync_body.md" \
        FAKE_LOG="${work}/out/calls.log" \
        FAKE_OUT="${work}/out" \
        bash "$SUT" sync >/dev/null 2>&1 || sync_rc=$?
}

calls() {
    tr '\n' ' ' <"${work}/out/calls.log" | sed 's/ $//'
}

expect_calls() {
    local name="$1" expected="$2"
    if [ "$sync_rc" -eq 0 ] && [ "$(calls)" = "$expected" ]; then
        pass
    else
        fail "${name}: 期待 '${expected}' / 実際 '$(calls)'（終了コード ${sync_rc}）"
    fi
}

cat >"${work}/sync_outdated.json" <<EOF
{
  $(outdated_entry typescript 5.5.2 7.0.2),
  $(outdated_entry prettier 3.9.9 3.9.10)
}
EOF

# 正常系: 追跡 issue が無ければ作る。似た題名の別の issue は追跡 issue とみなさない
printf '[{"number": 88, "title": "%s（メモ）"}]' "$TRACKER_TITLE" >"${work}/sync_issues.json"
run_sync
expect_calls "追跡 issue が無ければ作成だけする（作成自体が通知になるのでコメントしない）" "create"
# shellcheck disable=SC2016 # バッククォートは Markdown のコード表記
if [ -f "${work}/out/created.md" ] && grep -qF '| `typescript` | 5.5.2 | 7.0.2 | 開発 |' "${work}/out/created.md"; then
    pass
else
    fail "作成した issue の本文に検出結果が載るべき"
fi
# 次の run_sync で out/ は作り直されるため、作成した本文を退避して後続のケースの「前回の本文」に使う
cp "${work}/out/created.md" "${work}/created_body.md" 2>/dev/null || : >"${work}/created_body.md"

# 正常系: 前回と同じ検出結果なら、本文も変わらず、何も呼ばない
printf '[{"number": 191, "title": "%s"}]' "$TRACKER_TITLE" >"${work}/sync_issues.json"
cp "${work}/created_body.md" "${work}/sync_body.md"
run_sync
expect_calls "前回と同じなら本文の更新もコメントもしない" ""

# 正常系: 最新のメジャーが進んだら本文を更新し、コメントで通知する
#（前回の本文を「typescript の最新が 6.0.3 だった週」のものに書き換えて再現する）
sed 's/7\.0\.2/6.0.3/g' "${work}/created_body.md" >"${work}/sync_body.md"
run_sync
expect_calls "最新メジャーが進んだら本文を更新してコメントする" "edit 191 comment 191"
# shellcheck disable=SC2016 # バッククォートは Markdown のコード表記
if [ -f "${work}/out/comment.md" ] && grep -qF -- '- `typescript` 5.5.2 → 7.0.2' "${work}/out/comment.md"; then
    pass
else
    fail "コメントに新しく出たメジャー更新が載るべき"
fi

# 準正常系: メジャー差が無く、追跡 issue も無ければ何も作らない
echo "{ $(outdated_entry prettier 3.9.9 3.9.10) }" >"${work}/sync_outdated.json"
echo '[]' >"${work}/sync_issues.json"
run_sync
expect_calls "メジャー差も追跡 issue も無ければ何もしない" ""

# 異常系: pnpm outdated の出力が読めなければ、issue に触らずに終了コード 2 で落ちる
echo 'ERR_PNPM_FETCH_404 registry error' >"${work}/sync_outdated.json"
printf '[{"number": 191, "title": "%s"}]' "$TRACKER_TITLE" >"${work}/sync_issues.json"
run_sync
if [ "$sync_rc" -eq 2 ] && [ "$(calls)" = "" ]; then
    pass
else
    fail "読めない出力では issue に触らず終了コード 2 で落ちるべき: 実際 ${sync_rc} / '$(calls)'"
fi

echo "major-updates tests: ${passes} passed, ${failures} failed"
[ "$failures" -eq 0 ]
