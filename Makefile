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

# 全ターゲットはファイルを生成しない（同名ファイルがあっても常に実行する）
.PHONY: help setup install sample dev build start lint format format-check \
        type-check test test-run test-coverage test-it test-e2e check \
        docker-build docker-run tf-init tf-plan tf-apply clean

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

## format: Prettier で整形する
format:
	$(PNPM) format

## format-check: Prettier の整形チェック（差分のみ）
format-check:
	$(PNPM) format:check

## type-check: TypeScript の型チェック (tsc --noEmit)
type-check:
	$(PNPM) type-check

## check: lint + format-check + type-check + test-run をまとめて実行する
check: lint format-check type-check test-run

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
## tf-init: Terraform を初期化する
tf-init:
	cd $(TF_DIR) && terraform init

## tf-plan: Terraform の変更計画を表示する
tf-plan:
	cd $(TF_DIR) && terraform plan

## tf-apply: Terraform の変更を適用する
tf-apply:
	cd $(TF_DIR) && terraform apply

# ---- クリーンアップ ----------------------------------------------------
## clean: ビルド成果物・テスト成果物を削除する
clean:
	rm -rf .next coverage playwright-report test-results
