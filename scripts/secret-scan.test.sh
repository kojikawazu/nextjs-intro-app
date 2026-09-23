#!/usr/bin/env bash
#
# scripts/secret-scan.sh と .gitignore の検出対象を検証する（issue #160 / #161）。
#
# 一時ディレクトリに Git リポジトリを作り、ファイルを 1 つずつ追跡させてスキャンの終了コードを
# 確かめる。検出ロジックが壊れると本番のスキャンは「常に OK」になり気づけないため、
# CI では本番スキャンの前にこのテストを走らせる。
#
# 使い方: scripts/secret-scan.test.sh   （リポジトリのルートで実行）
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
readonly ROOT
readonly SCAN="${ROOT}/scripts/secret-scan.sh"

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

# 空のリポジトリを作り直す。ケース同士が影響しないよう毎回まっさらにする。
fresh_repo() {
    rm -rf "${work}/repo"
    git init -q "${work}/repo"
}

# path を content で作り、git add -f で追跡させる（.gitignore をすり抜けた状況を再現する）
track() {
    local path="$1" content="${2:-dummy}"
    mkdir -p "$(dirname "${work}/repo/${path}")"
    printf '%s\n' "$content" >"${work}/repo/${path}"
    git -C "${work}/repo" add -f -- "$path"
}

expect_detected() {
    local path="$1" content="${2:-dummy}"
    fresh_repo
    track "$path" "$content"
    if bash "$SCAN" "${work}/repo" >/dev/null 2>&1; then
        fail "検出されるべき: ${path}"
    else
        pass
    fi
}

expect_clean() {
    local path="$1" content="${2:-dummy}"
    fresh_repo
    track "$path" "$content"
    if bash "$SCAN" "${work}/repo" >/dev/null 2>&1; then
        pass
    else
        fail "検出されるべきでない: ${path}"
    fi
}

# 本物の .gitignore で除外されるか（--no-index: 追跡状態に関係なくパターンだけで判定）
expect_ignored() {
    local path="$1"
    if git -C "$ROOT" check-ignore -q --no-index -- "$path"; then
        pass
    else
        fail ".gitignore で除外されるべき: ${path}"
    fi
}

# テスト用の SA キー。判定に必要なのは "type": "service_account" と "private_key" キーの存在だけ。
# 値に PEM ヘッダー（BEGIN PRIVATE KEY）を書くと、public リポジトリで鍵の混入と誤認されうるため "dummy" にする
readonly FAKE_SA_KEY='{
  "type": "service_account",
  "project_id": "example-project",
  "private_key": "dummy"
}'

# --- 正常系: 秘匿ファイルが無ければ通る ----------------------------------------

fresh_repo
track "src/app/page.tsx"
if bash "$SCAN" "${work}/repo" >/dev/null 2>&1; then pass; else fail "通常のファイルだけのリポジトリで検出された"; fi

# --- 準正常系: 名前で検出する（#160 / #161） -----------------------------------

# Terraform（#161）
for f in terraform/terraform.tfvars terraform/prod.tfvars terraform/prod.auto.tfvars \
    terraform/terraform.tfvars.json terraform/terraform.tfstate \
    terraform/terraform.tfstate.backup terraform/errored.tfstate terraform/tf.tfplan; do
    expect_detected "$f"
done

# SA キーの名前（#160）
for f in service-account.json service-account-key.json service_account.json \
    serviceAccountKey.json serviceAccount.json credentials.json \
    config/example-project-123456-1a2b3c4d5e6f.json my-project-0123456789ab.json; do
    expect_detected "$f"
done

# 既存の検出対象が退行していないこと
for f in .env .env.production server.key cert.pem id_rsa; do
    expect_detected "$f"
done

# --- 準正常系: 中身で検出する（#160） ------------------------------------------

# 名前からは SA キーと分からなくても、中身が SA キーなら落とす
expect_detected "config/app-settings.json" "$FAKE_SA_KEY"
expect_detected "deploy/gcp.json" "$FAKE_SA_KEY"

# --- 誤検知しないこと ----------------------------------------------------------

for f in terraform/terraform.tfvars.example terraform/.terraform.lock.hcl terraform/main.tf \
    .env.example package.json tsconfig.json sample.json sample.example.json \
    src/types/env.d.ts e2e/fixtures/portfolio.json; do
    expect_clean "$f"
done

# 片方のキーしか持たない JSON は SA キーではない
expect_clean "config/only-type.json" '{ "type": "service_account" }'
expect_clean "config/only-key.json" '{ "private_key": "not-a-real-key" }'

# ドキュメント中の説明文は中身の判定の対象外（*.json に限る）
expect_clean "docs/security.md" "$FAKE_SA_KEY"

# 12 桁でない・16 進でない接尾辞は既定名ではない
expect_clean "data/report-2026.json"
expect_clean "data/build-abcdefghijkl.json"

# --- .gitignore（#160 の受け入れ条件） -----------------------------------------

for f in service-account.json service-account-key.json service_account.json \
    serviceAccountKey.json serviceAccount.json credentials.json gcp-key.json \
    example-project-123456-1a2b3c4d5e6f.json config/my-project-0123456789ab.json \
    terraform/terraform.tfvars terraform/prod.auto.tfvars terraform/terraform.tfvars.json \
    terraform/terraform.tfstate terraform/terraform.tfstate.backup terraform/errored.tfstate \
    terraform/tf.tfplan .env .env.production; do
    expect_ignored "$f"
done

# 追跡すべきファイルは除外されないこと
for f in .env.example terraform/.terraform.lock.hcl package.json tsconfig.json sample.example.json; do
    if git -C "$ROOT" check-ignore -q --no-index -- "$f"; then
        fail ".gitignore で除外されるべきでない: ${f}"
    else
        pass
    fi
done

echo "secret-scan tests: ${passes} passed, ${failures} failed"
[ "$failures" -eq 0 ]
