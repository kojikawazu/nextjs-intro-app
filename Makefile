# TechProfile Pro - Makefile
#
# pnpm スクリプト・セットアップ・Docker・Terraform の主要コマンドを集約するタスクランナー。
# 実体は package.json の scripts / README の手順に委譲する薄いラッパー。
# 使い方: `make` または `make help` でターゲット一覧を表示。

# ---- 設定 --------------------------------------------------------------
# パッケージマネージャは pnpm に固定（npm / yarn は使用しない）
PNPM        := pnpm
# Docker イメージ名（README のローカルビルド確認に合わせる）
IMAGE       := techprofile-pro
# Terraform 作業ディレクトリ
TF_DIR      := terraform
# state の保管先。バケット名は public リポジトリにコミットしないため、
# 環境変数 TF_STATE_BUCKET（例: export TF_STATE_BUCKET=<bucket>）で渡す。prefix はリポジトリ名と 1:1
TF_STATE_BUCKET ?=
TF_PREFIX   := nextjs-intro-app
# tfvars の同期はインフラ共通リポジトリの scripts/tfvars.sh を直接呼ぶ（各リポジトリへコピーしない規約）。
# clone 先は環境により異なり、public リポジトリに手元のパスも出さないため、既定値は置かず環境変数で渡す
MY_INFRA_DIR ?=

# 全ターゲットはファイルを生成しない（同名ファイルがあっても常に実行する）
.PHONY: help setup install sample dev build start lint format format-check \
        type-check test test-run test-coverage test-it test-e2e check lint-actions lint-fix lint-md lint-md-fix \
        docker-build docker-run tf-init tf-plan tf-apply tf-vars-pull tf-vars-push tf-require-bucket tf-require-infra-dir clean

# デフォルトターゲット: ヘルプ表示
.DEFAULT_GOAL := help

# ---- ヘルプ ------------------------------------------------------------
## help: このヘルプを表示する
help:
	@echo "TechProfile Pro - 利用可能なコマンド:"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  /'

# ---- セットアップ ------------------------------------------------------
## setup: 依存関係のインストールと表示データ(sample.json)を用意する
setup: install sample

## install: 依存関係をインストールする (pnpm install)
install:
	$(PNPM) install

## sample: sample.example.json を sample.json にコピーする（未作成時のみ）
sample:
	@test -f sample.json || cp sample.example.json sample.json
	@echo "sample.json を用意しました"

# ---- 開発 --------------------------------------------------------------
## dev: 開発サーバーを起動する (next dev)
dev:
	$(PNPM) dev

## build: プロダクションビルドを実行する (next build)
build:
	$(PNPM) build

## start: プロダクションサーバーを起動する (next start)
start:
	$(PNPM) start

# ---- 品質チェック ------------------------------------------------------
## lint: ESLint を実行する（JSDoc ルール含む）
lint:
	$(PNPM) lint

## lint-fix: ESLint の自動修正可能な違反を直す
lint-fix:
	$(PNPM) lint:fix

## lint-md: Markdown を markdownlint で検証する
lint-md:
	$(PNPM) lint:md

## lint-md-fix: Markdown の自動修正可能な違反を直す
lint-md-fix:
	$(PNPM) lint:md:fix

## format: Prettier で整形する
format:
	$(PNPM) format

## format-check: Prettier の整形チェック（差分のみ）
format-check:
	$(PNPM) format:check

## type-check: TypeScript の型チェック (tsc --noEmit)
type-check:
	$(PNPM) type-check

## lint-actions: GitHub Actions ワークフローを検証する (actionlint / 要 Docker)
lint-actions:
	docker run --rm -v "$(PWD)":/repo --workdir /repo rhysd/actionlint:1.7.12 -color

## check: lint + lint-md + format-check + type-check + test-run をまとめて実行する
check: lint lint-md format-check type-check test-run

# ---- テスト ------------------------------------------------------------
## test: ユニットテストを watch モードで実行する (vitest)
test:
	$(PNPM) test

## test-run: ユニットテストを 1 回実行する (vitest run)
test-run:
	$(PNPM) test:run

## test-coverage: ユニットテスト + カバレッジ計測
test-coverage:
	$(PNPM) test:coverage

## test-it: 統合テストを実行する（要 Docker: fake-gcs-server + MSW）
test-it:
	$(PNPM) test:it

## test-e2e: E2E テストを実行する（要 Docker + 事前 build。Playwright）
test-e2e:
	$(PNPM) test:e2e

# ---- Docker ------------------------------------------------------------
## docker-build: Docker イメージをビルドする
docker-build:
	docker build -t $(IMAGE) .

## docker-run: ビルド済みイメージをローカル起動する (http://localhost:3000)
docker-run:
	docker run --rm -p 3000:3000 $(IMAGE)

# ---- Terraform ---------------------------------------------------------
## tf-init: Terraform を初期化する（要 TF_STATE_BUCKET）
tf-init: tf-require-bucket
	cd $(TF_DIR) && terraform init -reconfigure \
		-backend-config="bucket=$(TF_STATE_BUCKET)" -backend-config="prefix=$(TF_PREFIX)"

## tf-plan: Terraform の変更計画を表示する
tf-plan:
	cd $(TF_DIR) && terraform plan

## tf-apply: Terraform の変更を適用する
tf-apply:
	cd $(TF_DIR) && terraform apply

# TF_STATE_BUCKET 未設定のまま init しないよう検査する（空の bucket で backend を構成させない）
tf-require-bucket:
	@test -n "$(TF_STATE_BUCKET)" || { echo "TF_STATE_BUCKET を設定してください（例: export TF_STATE_BUCKET=<bucket>）"; exit 1; }

tf-require-infra-dir:
	@test -x "$(MY_INFRA_DIR)/scripts/tfvars.sh" || { echo "MY_INFRA_DIR にインフラ共通リポジトリの clone 先を設定してください（例: export MY_INFRA_DIR=<path>）"; exit 1; }

## tf-vars-pull: 共有バケットから terraform.tfvars を取得する（tf-init 後に実行。上書きは FORCE=--force）
# bucket / prefix は init 済みの backend 設定から共通スクリプトが読む。権限 600 で作成される
tf-vars-pull: tf-require-infra-dir
	$(MY_INFRA_DIR)/scripts/tfvars.sh pull --dir $(TF_DIR) $(FORCE)

## tf-vars-push: ローカルの terraform.tfvars を共有バケットへ保存する（上書きは FORCE=--force）
# 内容が異なれば止まる。上書きしてもバケット側はバージョニングで旧版が残る
tf-vars-push: tf-require-infra-dir
	$(MY_INFRA_DIR)/scripts/tfvars.sh push --dir $(TF_DIR) $(FORCE)

# ---- クリーンアップ ----------------------------------------------------
## clean: ビルド成果物・テスト成果物を削除する
clean:
	rm -rf .next coverage playwright-report test-results
