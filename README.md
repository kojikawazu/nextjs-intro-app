# TechProfile Pro - Portfolio Site

[![Deploy to Cloud Run](https://github.com/kojikawazu/nextjs-intro-app/actions/workflows/deploy_to_googlecloud.yml/badge.svg)](https://github.com/kojikawazu/nextjs-intro-app/actions/workflows/deploy_to_googlecloud.yml)

ソフトウェアエンジニア向けの **1 ページ完結型ポートフォリオサイト**。表示内容を JSON（ローカルの `sample.json` または Google Cloud Storage 上のファイル）で差し替えられるテンプレートとして使えます。Next.js 15 (App Router) + TypeScript + Tailwind CSS 製。

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

`Hero（キャッチコピー・実績サマリ）` → `About（プロフィール・SNS）` → `Career（案件ごとの経歴）` → `Contact（お問い合わせフォーム）` → `Footer`

**職務経歴書のように読ませる設計**です。装飾よりも情報の構造を優先し、見出しと罫線で区切った紙面に、
明朝（見出し）とゴシック（本文）を組み合わせて配置しています。ヘッダーからの **スムーススクロール**、
**ライト / ダークの切り替え**（OS 設定に追従。選択は Cookie に保存）に対応します。

<!-- スクリーンショットを追加する場合はここに配置してください:
![TechProfile Pro screenshot](docs/assets/screenshot.png)
-->

## 🚀 技術スタック

| 分類 | 採用技術 |
|------|----------|
| Framework | Next.js 15.5.25 (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 |
| Form | React Hook Form + Zod（`@hookform/resolvers`） |
| Image | `next/image`（`next.config.js` で `images.unoptimized: true`。GCS 上の外部画像対応のため最適化は無効） |
| Email | Resend（お問い合わせフォーム送信） |
| Data Source | Google Cloud Storage（本番）／ `sample.json`（開発フォールバック） |
| Deploy | Google Cloud Run（Docker + GitHub Actions + Terraform） |
| Package Manager | pnpm 10.33.0（`packageManager` でピン留め） |

## 📋 必要条件

- **Node.js** 24.0.0 以上（`package.json` の `engines.node` が正本。本番 Docker / CI とも 24 系）
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

ブラウザで <http://localhost:3000> を開くと、サンプルデータで表示されます。

> **仕組み**: 開発環境（`NODE_ENV=development`）では、プロジェクトルートに `sample.json` があればそれを優先的に読み込みます（`src/repositories/portfolio.ts`）。`sample.json` は `.gitignore` 済みなので、自分のデータで自由に上書きできます。GCS 認証情報は不要です。
>
> ⚠️ **お問い合わせフォームの送信**には Resend の環境変数が別途必要です（下記「セットアップ詳細」参照）。未設定でも画面表示・他セクションの動作には影響しません。

## 🛠 セットアップ詳細

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

```text
nextjs-intro-app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API ルート (portfolio / contact)
│   │   ├── globals.css      # グローバルスタイル
│   │   ├── layout.tsx       # ルートレイアウト（メタデータ・SEO）
│   │   ├── page.tsx         # ホームページ（Server Component・データ取得）
│   │   ├── client.tsx       # ホームページの描画・対話（Client Component）
│   │   ├── error.tsx        # データ取得失敗時のエラーバウンダリ
│   │   ├── sitemap.ts       # sitemap.xml の生成
│   │   └── robots.ts        # robots.txt の生成
│   ├── components/          # UI コンポーネント（Atomic Design）
│   │   ├── atoms/           # Atoms（最小単位）
│   │   ├── molecules/       # Molecules（複合）
│   │   └── organisms/       # Organisms（有機体）
│   ├── repositories/        # 外部 I/O（GCS / Resend / ポートフォリオ取得）
│   ├── schemas/             # Zod スキーマ（クライアント / サーバーで共有）
│   ├── lib/                 # 純粋ユーティリティ（通信しない: 日付整形 / サイトURL解決）
│   ├── constants/           # 全環境で不変な値（Cookie 名など。環境変数は置かない）
│   ├── types/               # TypeScript 型定義（PortfolioData 等）
│   └── utils/               # クライアント側ユーティリティ（cn など）
├── docs/                    # 仕様・設計ドキュメント（索引: docs/README.md）
├── terraform/               # Cloud Run / Artifact Registry の IaC
├── .github/workflows/       # GitHub Actions（Cloud Run 自動デプロイ）
├── Dockerfile               # マルチステージビルド（pnpm / node:24-alpine）
├── sample.example.json      # 表示データのサンプル（cp して sample.json に）
└── .env.example             # 環境変数テンプレート
```

## 🎨 コンポーネント設計

[Atomic Design](./docs/component-design-report/01-atomic-design.md) に基づき 3 階層で構成しています（Templates 層は省略し `page.tsx` が担当）。

- **Atoms**: Button, Input, TextArea, Badge, ThemeToggle
- **Molecules**: CareerCard, SocialLinks
- **Organisms**: Header, ContactForm

クライアントコンポーネントのロジックは `src/hooks/`（`useTheme`）へ切り出し、コンポーネントは描画に専念させています。
クラス結合は [`cn()`](./docs/component-design-report/02-cn-utility.md)（`clsx` + `tailwind-merge`）、フォーム部品は [`forwardRef`](./docs/component-design-report/03-forward-ref.md) で ref を転送しています。

### レスポンシブ（Tailwind ブレークポイント基準）

- **Mobile**: < 768px
- **Tablet（`md`）**: 768px - 1023px
- **Desktop（`lg` 以上）**: ≥ 1024px

## 📊 データ管理

ポートフォリオ表示データは Server Component（`src/app/page.tsx`）が `src/repositories/portfolio.ts` を直接呼んで取得します（`GET /api/portfolio` も同じデータを返す公開エンドポイントとして維持していますが、画面表示には使っていません）。

- **本番**: Google Cloud Storage 上の JSON を読み込み（`src/repositories/gcs.ts`）
- **開発**: プロジェクトルートの `sample.json` があればフォールバックとして利用（`src/repositories/portfolio.ts`）

データ構造の正準は型定義 [`src/types/portfolio.ts`](./src/types/portfolio.ts)、実例は [`sample.example.json`](./sample.example.json) を参照してください。主なトップレベルキー:

| キー | 内容 |
|------|------|
| `navbar_data` | ナビゲーション情報 |
| `hero_data` | ヒーローセクション |
| `about_data` | 自己紹介・SNS リンク |
| `career_title_data` | 経歴カードのラベル定義 |
| `career_data` | 経歴情報（配列） |
| `contact_data` | お問い合わせフォーム設定 |
| `footer_data` | フッター情報 |

## 🔧 利用可能なスクリプト

```bash
pnpm dev           # 開発サーバー起動
pnpm build         # プロダクションビルド
pnpm start         # プロダクションサーバー起動
pnpm lint          # ESLint 実行（JSDoc ルール含む）
pnpm lint:fix      # ESLint の自動修正
pnpm lint:md       # markdownlint 実行（Markdown の静的検査）
pnpm lint:md:fix   # markdownlint の自動修正
pnpm format        # Prettier で整形
pnpm format:check  # Prettier 整形チェック（差分のみ）
pnpm type-check    # TypeScript 型チェック（tsc --noEmit）
pnpm test          # Vitest（watch モード。ユニットテスト）
pnpm test:run      # Vitest（1回実行。CI で使用）
pnpm test:coverage # Vitest + カバレッジ計測
pnpm test:it       # 統合テスト（要 Docker。fake-gcs-server コンテナ + MSW）
pnpm test:e2e      # E2E（要 Docker + ビルド。Playwright + fake-gcs-server コンテナ）
```

> 🛠️ **Makefile も同梱**しています。上記スクリプトや Docker / Terraform / セットアップ手順を短いコマンドで実行できます。`make`（または `make help`）でターゲット一覧を表示します。
>
> ```bash
> make setup   # pnpm install + sample.json 用意（= クイックスタートの 2〜3）
> make dev     # 開発サーバー起動
> make check   # lint + format:check + type-check + test:run をまとめて実行
> make test-it # 統合テスト（要 Docker）
> ```
>
> ℹ️ テストは **Vitest + Testing Library**（UT/IT）と **Playwright**（E2E）を使用。
>
> - **ユニットテスト**: ユーティリティ関数（`cn` / `toDateString` / `ContactFormSchema`）を実装済み。
> - **統合テスト（`pnpm test:it`、要 Docker）**: GCS は [fake-gcs-server](https://github.com/fsouza/fake-gcs-server) コンテナ（Testcontainers）で実データ経路を検証、Resend は [MSW](https://mswjs.io/) で HTTP をモック。`GET /api/portfolio`・`POST /api/contact`・`gcs` を対象。
> - **E2E（`pnpm test:e2e`、要 Docker + 事前 `pnpm build`）**: [Playwright](https://playwright.dev/) で実ブラウザからシナリオ検証。ポートフォリオ表示は fake-gcs-server コンテナの実データ、お問い合わせ送信・失敗系はブラウザで API をスタブ（Resend はエミュレータ無し）。正常/準正常/異常のシナリオを網羅。
> - コンポーネントテストは今後拡充予定。テスト方針・全テストケース設計は [`docs/08-test-specification.md`](./docs/08-test-specification.md) を参照してください。

## 🎯 機能

凡例: ✅ 実装済み ／ 🟡 部分対応 ／ 🔜 未実装（計画中）

| 機能 | 状態 | 補足 |
|------|:----:|------|
| レスポンシブデザイン | ✅ | Mobile / Tablet / Desktop の 3 段階 |
| スムーススクロールナビゲーション | ✅ | ヘッダー＋モバイルメニュー |
| ライト / ダークテーマ切替 | ✅ | 既定は OS の `prefers-color-scheme`。選択は Cookie に保存し、サーバー側で初期 HTML に反映するためちらつかない |
| Hero / About / Career / Product / Articles / Contact / Footer | ✅ | 1 ページ構成。個人開発（Product）は issue #128、執筆記事（Articles）は issue #127 で追加 |
| お問い合わせフォーム（バリデーション付き） | ✅ | React Hook Form + Zod、送信は Resend |
| SEO メタデータ | 🟡 | `layout.tsx` で title/OGP/Twitter/canonical を設定（`metadataBase` 基準）。`og:image` は未設定 |
| サーバーサイドレンダリング | ✅ | `page.tsx` がサーバー側でデータ取得し、初期 HTML に全セクションの本文を含む |
| sitemap.xml / robots.txt | ✅ | `src/app/sitemap.ts` / `src/app/robots.ts` でビルド時に静的生成 |
| アクセシビリティ | 🟡 | フォームは `htmlFor` 関連付け・`aria-describedby` / `aria-invalid`・送信結果の `role="status"` / `role="alert"` に対応。`prefers-reduced-motion: reduce` で動きを無効化。本文・見出しは WCAG 2.1 AA（4.5:1）を両テーマで満たす。スキップリンクは未対応 |
| 自動テスト | ✅ | Vitest + Testing Library（ユニット 344 件・全コンポーネントを含む）／ Playwright（E2E・スモーク 45 件）。方針は [docs/08](./docs/08-test-specification.md) |
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

### インフラ（Terraform）

アプリのデプロイは上記の GitHub Actions、**インフラと Cloud Run の環境変数は Terraform** が正本です（分担の詳細は [docs/09 §7.5](./docs/09-architecture-specification.md)）。

state と `terraform.tfvars` は共有 GCS バケットの `nextjs-intro-app/` に置いています（どちらも Git には含めません）。バケット名は公開しないため、環境変数 `TF_STATE_BUCKET` で渡します。

```bash
export TF_STATE_BUCKET=<bucket>
make tf-init        # backend（GCS）に接続
make tf-vars-pull   # バケットから terraform/terraform.tfvars を取得
make tf-plan        # 差分を確認
make tf-apply       # 適用
make tf-vars-push   # tfvars を変更したらバケットへ保存（確認あり）
```

`terraform.tfvars` に必要な変数（値は記載しません）:

| 変数 | 内容 |
|---|---|
| `gcp_project_id` / `gcp_region` | GCP プロジェクト ID / リージョン |
| `repository_id` / `app_name` | Artifact Registry のリポジトリ名 / イメージ名 |
| `service_name` / `http_port` | Cloud Run サービス名 / コンテナポート |
| `invoker_role` / `invoker_member` | 公開設定（`roles/run.invoker` / `allUsers`） |
| `site_url` | `SITE_URL` として注入するサイト URL |
| `gcs_private_bucket_name` / `gcs_json_path` | 表示データの GCS バケット / パス |
| `resend_api_key` / `resend_from_email` / `my_mail_address` | 問い合わせメール（Resend）の設定 |
| `node_env` / `next_telemetry_disabled` | 実行時の環境変数 |

### カスタムドメイン

本番は `https://introtechkkplus.com`（apex）で公開しています。DNS は Cloudflare、オリジンは Cloud Run です。

| ホスト | Type | 値 | Proxy |
|---|---|---|---|
| `@` | A / AAAA | Google の固定 IP（計 8 件） | **DNS only** |
| `www` | CNAME | `ghs.googlehosted.com.` | **DNS only** |

apex と `www` の両方を Cloud Run にマッピングし、正規 URL は `layout.tsx` の canonical（apex）で示しています。
Cloudflare のプロキシ（オレンジ雲）を有効にすると Cloud Run の証明書発行が完了しないため、初回は必ず DNS only にします。
構築手順とレコードの取得方法は [docs/09 §7.4](./docs/09-architecture-specification.md) を参照してください。

> サイト URL は環境変数 `SITE_URL` で上書きできます（未設定時は `src/lib/site-url.ts` の正規オリジン）。
> `NEXT_PUBLIC_` を付けるとビルド時に値が焼き込まれ、Cloud Run の実行時環境変数では上書きできなくなるため、接頭辞は付けません。

## 🤝 コントリビューション

本リポジトリは **GitHub Flow** を採用しています。開発フロー・ブランチ命名・テスト方針・品質ゲートは [`CLAUDE.md`](./CLAUDE.md) と [`.claude/rules/`](./.claude/rules/) に定義しています。

1. 作業ブランチを作成（`feature/*`, `fix/*`, `chore/*` 等）
2. 変更をコミット（main への直接コミットは禁止）
3. push して Pull Request を作成
4. レビュー後、**マージは人間が実施**（自動マージ禁止）

## 📄 ライセンス

[MIT License](./LICENSE) の下で公開しています。
