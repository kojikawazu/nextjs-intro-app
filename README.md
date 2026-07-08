# TechProfile Pro - Portfolio Site

[![Deploy to Cloud Run](https://github.com/kojikawazu/nextjs-intro-app/actions/workflows/deploy_to_googlecloud.yml/badge.svg)](https://github.com/kojikawazu/nextjs-intro-app/actions/workflows/deploy_to_googlecloud.yml)

ソフトウェアエンジニア向けの **1 ページ完結型ポートフォリオサイト**。表示内容を JSON（ローカルの `sample.json` または Google Cloud Storage 上のファイル）で差し替えられるテンプレートとして使えます。Next.js 14 (App Router) + TypeScript + Tailwind CSS 製。

> 📚 仕様・設計の詳細は [`docs/`](./docs/README.md)（ドキュメント索引）を参照してください。

## 目次

- [📸 プレビュー](#-プレビュー)
- [🚀 技術スタック](#-技術スタック)
- [📋 必要条件](#-必要条件)
- [⚡ クイックスタート](#-クイックスタート)
- [🛠️ セットアップ詳細](#-セットアップ詳細)
- [📁 プロジェクト構成](#-プロジェクト構成)
- [🎨 コンポーネント設計](#-コンポーネント設計)
- [📊 データ管理](#-データ管理)
- [🔧 利用可能なスクリプト](#-利用可能なスクリプト)
- [🎯 機能](#-機能)
- [🚀 デプロイ](#-デプロイ)
- [🤝 コントリビューション](#-コントリビューション)
- [📄 ライセンス](#-ライセンス)

## 📸 プレビュー

1 ページのスクロール型サイトで、以下のセクションを上から順に表示します。

`Hero（キャッチコピー＋CTA）` → `About（プロフィール・SNS）` → `Career（タイムライン）` → `Skills（カードグリッド）` → `Contact（お問い合わせフォーム）` → `Footer`

固定ヘッダーからの **スムーススクロール**、ダークテーマ＋グラスモーフィズム／ネオン調の演出が特徴です。

<!-- スクリーンショットを追加する場合はここに配置してください:
![TechProfile Pro screenshot](docs/assets/screenshot.png)
-->

## 🚀 技術スタック

| 分類 | 採用技術 |
|------|----------|
| Framework | Next.js 14.2.5 (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 |
| Form | React Hook Form + Zod（`@hookform/resolvers`） |
| Image | `next/image`（`next.config.js` で `images.unoptimized: true`。GCS 上の外部画像対応のため最適化は無効） |
| Email | Resend（お問い合わせフォーム送信） |
| Data Source | Google Cloud Storage（本番）／ `sample.json`（開発フォールバック） |
| Deploy | Google Cloud Run（Docker + GitHub Actions + Terraform） |
| Package Manager | pnpm 10.33.0（`packageManager` でピン留め） |

## 📋 必要条件

- **Node.js** 18.0.0 以上
- **pnpm** 10.x（リポジトリは `pnpm@10.33.0` を `packageManager` でピン留め。`corepack enable` で自動的に揃います）

## ⚡ クイックスタート

GCS や外部サービスの認証情報なしで、ローカルだけで動かす最短手順です。

```bash
# 1. クローン
git clone https://github.com/kojikawazu/nextjs-intro-app.git
cd nextjs-intro-app

# 2. 依存関係のインストール
pnpm install

# 3. 表示データを用意（同梱のサンプルをコピーするだけ）
cp sample.example.json sample.json

# 4. 開発サーバー起動
pnpm dev
```

ブラウザで http://localhost:3000 を開くと、サンプルデータで表示されます。

> **仕組み**: 開発環境（`NODE_ENV=development`）では、プロジェクトルートに `sample.json` があればそれを優先的に読み込みます（`src/lib/data-server.ts`）。`sample.json` は `.gitignore` 済みなので、自分のデータで自由に上書きできます。GCS 認証情報は不要です。
>
> ⚠️ **お問い合わせフォームの送信**には Resend の環境変数が別途必要です（下記「セットアップ詳細」参照）。未設定でも画面表示・他セクションの動作には影響しません。

## 🛠️ セットアップ詳細

環境変数は `.env.example` をコピーして設定します。各変数の必須/任意は `.env.example` 内のコメントを参照してください。

```bash
cp .env.example .env.local
```

| 用途 | 主な環境変数 | ローカル表示のみ | お問い合わせ送信 | 本番(GCS) |
|------|-------------|:----:|:----:|:----:|
| GCS データ取得 | `GCS_PRIVATE_BUCKET_NAME` / `GCS_JSON_PATH` / `GOOGLE_APPLICATION_CREDENTIALS` 等 | 不要※ | 不要 | **必須** |
| メール送信 | `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `MY_MAIL_ADDRESS` | 不要 | **必須** | 必須 |

※ ローカル表示のみなら `sample.json` があれば GCS は不要です。GCS をローカルから試す場合は `FORCE_GCS=true` を設定します。

詳細なセットアップ手順・環境変数一覧は [`docs/10-miscellaneous-specification.md`](./docs/10-miscellaneous-specification.md#3-開発環境セットアップガイド) と [`docs/06-security-specification.md`](./docs/06-security-specification.md#3-環境変数管理) を参照してください。

## 📁 プロジェクト構成

```
nextjs-intro-app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API ルート (portfolio / contact)
│   │   ├── globals.css      # グローバルスタイル
│   │   ├── layout.tsx       # ルートレイアウト（メタデータ・SEO）
│   │   └── page.tsx         # ホームページ（'use client'）
│   ├── components/          # UI コンポーネント（Atomic Design）
│   │   ├── atoms/           # Atoms（最小単位）
│   │   ├── molecules/       # Molecules（複合）
│   │   └── organisms/       # Organisms（有機体）
│   ├── lib/                 # サーバー側ライブラリ（GCS / Resend / データ取得）
│   ├── types/               # TypeScript 型定義（PortfolioData 等）
│   └── utils/               # クライアント側ユーティリティ（cn など）
├── docs/                    # 仕様・設計ドキュメント（索引: docs/README.md）
├── terraform/               # Cloud Run / Artifact Registry の IaC
├── .github/workflows/       # GitHub Actions（Cloud Run 自動デプロイ）
├── Dockerfile               # マルチステージビルド（pnpm / node:18-alpine）
├── sample.example.json      # 表示データのサンプル（cp して sample.json に）
└── .env.example             # 環境変数テンプレート
```

## 🎨 コンポーネント設計

[Atomic Design](./docs/component-design-report/01-atomic-design.md) に基づき 3 階層で構成しています（Templates 層は省略し `page.tsx` が担当）。

- **Atoms**: Button, Input, TextArea, Badge
- **Molecules**: SkillCard, CareerCard, SocialLinks
- **Organisms**: Header, ContactForm

クラス結合は [`cn()`](./docs/component-design-report/02-cn-utility.md)（`clsx` + `tailwind-merge`）、フォーム部品は [`forwardRef`](./docs/component-design-report/03-forward-ref.md) で ref を転送しています。

### レスポンシブ（Tailwind ブレークポイント基準）

- **Mobile**: < 768px
- **Tablet（`md`）**: 768px - 1023px
- **Desktop（`lg` 以上）**: ≥ 1024px

## 📊 データ管理

ポートフォリオ表示データは `GET /api/portfolio` 経由で取得します。

- **本番**: Google Cloud Storage 上の JSON を読み込み（`src/lib/gcs.ts`）
- **開発**: プロジェクトルートの `sample.json` があればフォールバックとして利用（`src/lib/data-server.ts`）

データ構造の正準は型定義 [`src/types/portfolio.ts`](./src/types/portfolio.ts)、実例は [`sample.example.json`](./sample.example.json) を参照してください。主なトップレベルキー:

| キー | 内容 |
|------|------|
| `navbar_data` | ナビゲーション情報 |
| `hero_data` | ヒーローセクション |
| `about_data` | 自己紹介・SNS リンク |
| `career_title_data` | 経歴カードのラベル定義 |
| `career_data` | 経歴情報（配列） |
| `skills_data` | 技術スキル（カード配列＋補足文） |
| `contact_data` | お問い合わせフォーム設定 |
| `footer_data` | フッター情報 |

## 🔧 利用可能なスクリプト

```bash
pnpm dev           # 開発サーバー起動
pnpm build         # プロダクションビルド
pnpm start         # プロダクションサーバー起動
pnpm lint          # ESLint 実行（JSDoc ルール含む）
pnpm format        # Prettier で整形
pnpm format:check  # Prettier 整形チェック（差分のみ）
pnpm type-check    # TypeScript 型チェック（tsc --noEmit）
pnpm test          # Vitest（watch モード。ユニットテスト）
pnpm test:run      # Vitest（1回実行。CI で使用）
pnpm test:coverage # Vitest + カバレッジ計測
pnpm test:it       # 統合テスト（要 Docker。fake-gcs-server コンテナ + MSW）
```

> ℹ️ テストは **Vitest + Testing Library** を使用。
> - **ユニットテスト**: ユーティリティ関数（`cn` / `toDateString` / `ContactFormSchema`）を実装済み。
> - **統合テスト（`pnpm test:it`、要 Docker）**: GCS は [fake-gcs-server](https://github.com/fsouza/fake-gcs-server) コンテナ（Testcontainers）で実データ経路を検証、Resend は [MSW](https://mswjs.io/) で HTTP をモック。`GET /api/portfolio`・`POST /api/contact`・`gcs` を対象。
> - コンポーネント / E2E テストは今後拡充予定。テスト方針・全テストケース設計は [`docs/08-test-specification.md`](./docs/08-test-specification.md) を参照してください。

## 🎯 機能

凡例: ✅ 実装済み ／ 🟡 部分対応 ／ 🔜 未実装（計画中）

| 機能 | 状態 | 補足 |
|------|:----:|------|
| レスポンシブデザイン | ✅ | Mobile / Tablet / Desktop の 3 段階 |
| スムーススクロールナビゲーション | ✅ | 固定ヘッダー＋モバイルメニュー |
| Hero / About / Career / Skills / Contact / Footer | ✅ | 1 ページ構成 |
| Skills の段階表示（初期 9 件 → 6 件ずつ追加） | ✅ | `page.tsx` の `and more...` |
| お問い合わせフォーム（バリデーション付き） | ✅ | React Hook Form + Zod、送信は Resend |
| SEO メタデータ | 🟡 | `layout.tsx` で title/OGP/Twitter 設定。`og:image` は未設定 |
| アクセシビリティ | 🟡 | 一部に `aria-label`。フォームの label 関連付け（`htmlFor`）や `aria-live` は未対応 |
| 自動テスト | 🔜 | ランナー未導入（[docs/08](./docs/08-test-specification.md)） |
| データ更新 UI（CMS / 管理画面） | 🔜 | 現状は GCS / `sample.json` を直接編集 |

## 🚀 デプロイ

### ローカルビルド確認

```bash
pnpm build
pnpm start
# もしくはコンテナで:
docker build -t techprofile-pro .
```

### Google Cloud Run（GitHub Actions 自動デプロイ）

`main` ブランチへの push をトリガーに [`.github/workflows/deploy_to_googlecloud.yml`](./.github/workflows/deploy_to_googlecloud.yml) が Docker イメージをビルドし、Artifact Registry 経由で Cloud Run にデプロイします。インフラ構成は [`terraform/`](./terraform/) で管理しています。

自分のフォークでデプロイするには、リポジトリの **Settings → Secrets and variables → Actions** に以下を設定してください。

| Secret | 用途 |
|--------|------|
| `GCP_SERVICE_ACCOUNT_KEY` | デプロイ用サービスアカウントの鍵 JSON |
| `GCP_PROJECT_ID` | GCP プロジェクト ID |
| `GCP_REGION` | デプロイ先リージョン（例: `asia-northeast1`） |
| `REPO_NAME` | Artifact Registry のリポジトリ名 |
| `APP_NAME` | コンテナイメージ名 |
| `GCP_CLOUD_RUN_SERVICE_NAME` | Cloud Run サービス名 |

> 本番では GCS（`GCS_PRIVATE_BUCKET_NAME` / `GCS_JSON_PATH`）と Resend の環境変数を Cloud Run 側に設定する必要があります。GCS 認証は Cloud Run の ADC（Application Default Credentials）を利用します。

## 🤝 コントリビューション

本リポジトリは **GitHub Flow** を採用しています。開発フロー・ブランチ命名・テスト方針・品質ゲートは [`CLAUDE.md`](./CLAUDE.md) と [`.claude/rules/`](./.claude/rules/) に定義しています。

1. 作業ブランチを作成（`feature/*`, `fix/*`, `chore/*` 等）
2. 変更をコミット（main への直接コミットは禁止）
3. push して Pull Request を作成
4. レビュー後、**マージは人間が実施**（自動マージ禁止）

## 📄 ライセンス

[MIT License](./LICENSE) の下で公開しています。
