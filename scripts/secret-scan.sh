#!/usr/bin/env bash
#
# 秘匿ファイルが Git の追跡対象に入っていないかを検査する（docs/06 §11.2）。
#
# .gitignore は未追跡ファイルにしか効かず、git add -f や一度追跡されたファイルは素通りする。
# ここはそれを「追跡された時点で落とす」2 層目。CI（secret-scan.yml）から呼ぶが、
# ローカルでも同じ判定を再現できるようスクリプトに切り出している。
#
# 判定は 2 系統:
#   1. 名前: 鍵・.env・Terraform の秘密ファイル・GCP SA キーとしてありがちな名前
#   2. 中身: 名前を問わず、GCP SA キーの JSON（"type": "service_account" と "private_key" を両方含む）
#
# 使い方: scripts/secret-scan.sh [<repo-dir>]   （既定はカレントディレクトリ）
# 終了コード: 0 = 検出なし / 1 = 検出あり
set -Eeuo pipefail

repo_dir="${1:-.}"

# 1. 名前による判定
#
# - Terraform: tfvars / tfstate は変数値・リソース属性を平文で含み、tfplan は sensitive 値も平文。
#   tfstate(\.[^/]+)? で *.tfstate.backup 等も拾う（errored.tfstate は *.tfstate に含まれる）。
#   .terraform.lock.hcl は provider のハッシュのみでコミット対象のため、ここに含めない。
# - SA キーの区切りは service-account / service_account / serviceAccountKey と揺れる。
#   キャメルケースだけを見ると、GCP で最も一般的な service-account.json を取りこぼす。
# - GCP コンソールでダウンロードした SA キーの既定名は <project-id>-<12 桁の 16 進>.json。
#   SA キーが紛れ込むなら最もありそうな名前のため、名前でも拾う（中身の判定と二重に守る）。
readonly NAME_PATTERN='(^|/)(\.env(\..+)?|[^/]+\.(key|pem|p12|pfx|jks|keystore|tfvars|tfvars\.json|tfplan|tfstate(\.[^/]+)?)|id_rsa|id_ed25519|id_dsa|credentials\.json|service[-_]?[Aa]ccount([-_]?[Kk]ey)?\.json|[a-z][a-z0-9-]+-[0-9a-f]{12}\.json)$'

# テンプレート（*.example 等）と型定義は秘密を含まないため除外する
readonly ALLOW_PATTERN='\.(example|sample|template|dist)$|\.env\.d\.ts$'

# grep は該当なしで終了コード 1 を返す。set -e 下で「秘匿ファイルが無い正常ケース」を
# 失敗にしないよう || true を付ける。
by_name=$(git -C "$repo_dir" ls-files \
    | grep -E "$NAME_PATTERN" \
    | grep -vE "$ALLOW_PATTERN" \
    || true)

# 2. 中身による判定
#
# SA キーの JSON は必ず "type": "service_account" と "private_key" を含むため、名前をどう
# 変えても検出できる。--all-match で「両方を含むファイル」に限る（片方だけの設定例などを
# 誤検知しない）。対象を *.json に絞るのは、ドキュメント中の説明文を誤検知しないため。
# git grep は追跡ファイルだけを読むため、未追跡のローカル鍵は対象外（それは .gitignore の役目）。
by_content=$(git -C "$repo_dir" grep -l --all-match \
    -e '"type"[[:space:]]*:[[:space:]]*"service_account"' \
    -e '"private_key"' \
    -- '*.json' \
    || true)

tracked=$(printf '%s\n%s\n' "$by_name" "$by_content" | sed '/^$/d' | sort -u)

if [ -n "$tracked" ]; then
    echo "::error::秘匿ファイルが Git 管理下にあります。.gitignore への追加や git rm --cached では履歴から消えないため、鍵・トークンのローテーションが必要になります。"
    echo "$tracked"
    exit 1
fi

echo "OK: 追跡対象に秘匿ファイルはありません"
