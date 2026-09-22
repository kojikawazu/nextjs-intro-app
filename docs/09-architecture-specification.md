# アーキテクチャ仕様書

## 目次

- [プロジェクト情報](#プロジェクト情報)
- [1. システムアーキテクチャ概要](#1-システムアーキテクチャ概要)
    - [1.1 全体構成図](#11-全体構成図)
    - [1.2 アーキテクチャパターン](#12-アーキテクチャパターン)
- [2. 技術スタック](#2-技術スタック)
    - [2.1 ランタイム依存パッケージ](#21-ランタイム依存パッケージ)
    - [2.2 開発依存パッケージ](#22-開発依存パッケージ)
    - [2.3 動作環境要件](#23-動作環境要件)
- [3. ディレクトリ構成](#3-ディレクトリ構成)
    - [3.1 プロジェクトルート](#31-プロジェクトルート)
    - [3.2 src ディレクトリ詳細](#32-src-ディレクトリ詳細)
- [4. コンポーネントアーキテクチャ](#4-コンポーネントアーキテクチャ)
    - [4.1 Atomic Design 階層](#41-atomic-design-階層)
    - [4.2 コンポーネント依存関係](#42-コンポーネント依存関係)
    - [4.3 コンポーネント設計原則](#43-コンポーネント設計原則)
- [5. データフローアーキテクチャ](#5-データフローアーキテクチャ)
    - [5.1 ポートフォリオデータ取得フロー](#51-ポートフォリオデータ取得フロー)
    - [5.2 お問い合わせ送信フロー](#52-お問い合わせ送信フロー)
    - [5.3 データソース戦略](#53-データソース戦略)
    - [5.4 状態管理](#54-状態管理)
- [6. スタイリングアーキテクチャ](#6-スタイリングアーキテクチャ)
    - [6.1 スタイリング技術構成](#61-スタイリング技術構成)
    - [6.2 配色トークン](#62-配色トークン)
    - [6.3 デザインシステム: 書類](#63-デザインシステム-書類)
        - [カスタムコンポーネントクラス](#カスタムコンポーネントクラス)
        - [カスタムユーティリティクラス](#カスタムユーティリティクラス)
    - [6.4 アニメーション](#64-アニメーション)
    - [6.5 影](#65-影)
    - [6.6 フォントファミリー](#66-フォントファミリー)
    - [6.7 配色トークンとテーマ切替](#67-配色トークンとテーマ切替)
        - [トークンの構造](#トークンの構造)
        - [テーマの解決経路](#テーマの解決経路)
        - [なぜインラインスクリプトを使わないか](#なぜインラインスクリプトを使わないか)
        - [なぜ layout.tsx ではなく page.tsx で読むか](#なぜ-layouttsx-ではなく-pagetsx-で読むか)
- [7. デプロイアーキテクチャ](#7-デプロイアーキテクチャ)
    - [7.1 Cloud Run デプロイ構成](#71-cloud-run-デプロイ構成)
    - [7.2 環境変数](#72-環境変数)
    - [7.3 GCS 認証戦略](#73-gcs-認証戦略)
    - [7.4 カスタムドメイン構成](#74-カスタムドメイン構成)

---

## プロジェクト情報

| 項目 | 内容 |
|------|------|
| プロジェクト名 | TechProfile Pro |
| ドキュメント種別 | アーキテクチャ仕様書 |
| バージョン | 1.0.0 |
| 作成日 | 2026-03-20 |
| 対象技術スタック | Next.js 14 / TypeScript / Tailwind CSS |

---

## 1. システムアーキテクチャ概要

### 1.1 全体構成図

```text
┌─────────────────────────────────────────────────────────────────┐
│                        クライアント（ブラウザ）                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   page.tsx ('use client')                 │  │
│  │                                                           │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Hero   │  │  About   │  │  Career  │  │  Contact  │  │  │
│  │  │ Section │  │ Section  │  │ Section  │  │ Section   │  │  │
│  │  └─────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  │  ┌─────────┐  ┌──────────┐                               │  │
│  │  │ Contact │  │  Footer  │                               │  │
│  │  │ Section │  │          │                               │  │
│  │  └─────────┘  └──────────┘                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│          │ (サーバー側で直接取得)            │ POST                │
│          ▼                                 ▼                    │
│  ┌──────────────────┐            ┌──────────────────┐          │
│  │ GET /api/portfolio│            │ POST /api/contact │          │
│  └──────────────────┘            └──────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
           │                                 │
           ▼                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│              Cloud Run (Docker コンテナ)                          │
│                                                                  │
│  ┌────────────────────────────┐  ┌────────────────────────────┐ │
│  │  API Route: /api/portfolio │  │  API Route: /api/contact   │ │
│  │  (Next.js Server)          │  │  (Next.js Server)          │ │
│  └────────────┬───────────────┘  └────────────┬───────────────┘ │
│               │                                │                 │
└───────────────┼────────────────────────────────┼─────────────────┘
                │                                │
                ▼                                ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   Google Cloud Storage   │    │      Resend Email API    │
│                          │    │                          │
│  ┌────────────────────┐  │    │  ┌────────────────────┐  │
│  │  JSON Data File    │  │    │  │   Email Delivery   │  │
│  │  (portfolio data)  │  │    │  │   Service          │  │
│  └────────────────────┘  │    │  └────────────────────┘  │
└──────────────────────────┘    └──────────────────────────┘
```

### 1.2 アーキテクチャパターン

本プロジェクトは以下のアーキテクチャパターンを採用している。

| パターン | 適用箇所 | 説明 |
|---------|---------|------|
| クライアントサイドレンダリング (CSR) | page.tsx | トップページ全体が `'use client'` ディレクティブによりクライアントコンポーネントとして動作 |
| API Routes パターン | /api/portfolio, /api/contact | サーバーサイドロジックを Next.js API Routes として分離 |
| Atomic Design | components/ | UI コンポーネントを Atoms / Molecules / Organisms の3階層で構造化 |
| Repository パターン | repositories/portfolio.ts | データソースの抽象化（GCS / ローカルファイルのフォールバック） |

---

## 2. 技術スタック

### 2.1 ランタイム依存パッケージ

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| next | 14.2.5 | React フレームワーク (App Router) |
| react | 19.3.0 | UI ライブラリ |
| react-dom | 19.3.0 | React DOM レンダラー |
| @google-cloud/storage | ^7.16.0 | Google Cloud Storage クライアント |
| resend | ^4.6.0 | メール送信サービスクライアント |
| react-hook-form | ^7.51.4 | フォーム状態管理 |
| @hookform/resolvers | ^3.6.0 | React Hook Form 用バリデーションリゾルバー |
| zod | ^3.23.8 | スキーマバリデーション |
| clsx | ^2.1.1 | 条件付きクラス名結合 |
| tailwind-merge | ^2.3.0 | Tailwind CSS クラスの競合解決 |

### 2.2 開発依存パッケージ

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| typescript | 5.5.2 | 型安全な JavaScript |
| @types/node | 24.13.6 | Node.js 型定義（実行環境の Node メジャーに揃える） |
| @types/react | 19.3.0 | React 型定義 |
| @types/react-dom | 19.3.0 | React DOM 型定義 |
| tailwindcss | 3.4.4 | ユーティリティファースト CSS フレームワーク |
| postcss | 8.4.38 | CSS 変換ツール |
| autoprefixer | 10.4.19 | ベンダープレフィックス自動付与 |
| eslint | 9.39.5 | JavaScript/TypeScript リンター（flat config） |
| eslint-config-next | 16.3.5 | Next.js 用 ESLint 設定。**アプリの Next.js は 15 系のまま**で、本パッケージは `next` への peer 依存を持たない（issue #133） |
| typescript-eslint | ^8.70.0 | TypeScript 用パーサ / プラグインの統合パッケージ（旧 `@typescript-eslint/*` v7 を置換） |
| eslint-plugin-jsdoc | ^64.5.0 | JSDoc（TSDoc）コメントの静的検査（`src/**` の TS/TSX 対象） |
| prettier | ^3.3.2 | コードフォーマッター |
| vitest | ^4.1.10 | テストランナー（ユニットテスト） |
| @vitest/coverage-v8 | ^4.1.10 | カバレッジ計測（v8 プロバイダ） |
| @testing-library/react | ^16.3.2 | React コンポーネントの描画・操作テスト（コンポーネントテスト導入時に使用） |
| @testing-library/jest-dom | ^6.9.1 | DOM アサーションマッチャー拡張 |
| @testing-library/user-event | ^14.6.1 | ユーザー操作のシミュレーション |
| jsdom | ^29.1.1 | テスト実行時のブラウザ環境エミュレーション |
| testcontainers | ^12.0.4 | 統合 / E2E テストで fake-gcs-server コンテナを起動（要 Docker） |
| msw | ^2.15.0 | 統合テストで Resend の HTTP をモック |
| @playwright/test | ^1.61.1 | E2E（実ブラウザ）テスト |

### 2.3 動作環境要件

| 項目 | 要件 |
|------|------|
| Node.js | >= 18.0.0 |
| pnpm | >= 10.0.0（`package.json` の `packageManager`: `pnpm@10.33.0`） |
| 対応ブラウザ | Chrome 最新, Firefox 最新, Safari 最新, Edge 最新 |
| TypeScript ターゲット | ES5（tsconfig.json の target 設定） |

---

## 3. ディレクトリ構成

### 3.1 プロジェクトルート

```text
nextjs-intro-app/
├── .next/                      # Next.js ビルド出力（git 管理外）
├── docs/                       # プロジェクトドキュメント
├── node_modules/               # pnpm パッケージ（git 管理外）
├── public/                     # 静的ファイル配信ディレクトリ
├── src/                        # アプリケーションソースコード
│   ├── app/                    # Next.js App Router
│   ├── components/             # UI コンポーネント
│   ├── repositories/           # 外部 I/O（GCS / Resend / ポートフォリオ取得）
│   ├── lib/                    # 純粋ユーティリティ（通信しない）
│   ├── types/                  # TypeScript 型定義
│   └── utils/                  # クライアントサイドユーティリティ
├── eslint.config.mjs           # ESLint 設定（flat config）
├── .gitignore                  # Git 除外設定
├── .prettierrc                 # Prettier 設定
├── next.config.js              # Next.js 設定
├── package.json                # プロジェクト定義・依存関係
├── postcss.config.js           # PostCSS 設定
├── tailwind.config.js          # Tailwind CSS 設定
└── tsconfig.json               # TypeScript 設定
```

### 3.2 src ディレクトリ詳細

```text
src/
├── app/                        # Next.js App Router ディレクトリ
│   ├── globals.css             # グローバルスタイル定義
│   │                             - Tailwind ディレクティブ (@tailwind)
│   │                             - Web フォント読み込み (Zen Old Mincho, Zen Kaku Gothic New)
│   │                             - 配色トークン 11 種と 4 ブロックの写像 (§6.2 / §6.7)
│   │                             - カスタムクラス (container, section-padding, section-heading,
│   │                               quote-panel, theme-toggle-light/dark)
│   ├── layout.tsx              # ルートレイアウト（async・Server Component）
│   │                             - HTML メタデータ設定 (OGP, Twitter Card, SEO)
│   │                             - html lang="ja" 設定
│   │                             - Cookie から配色テーマを解決し html data-theme に出力 (§6.7)
│   ├── page.tsx                # ホームページ（Server Component・データ取得）
│   ├── client.tsx              # ホームページの描画・対話（Client Component）
│   │                             - page.tsx: repositories からサーバー側でデータ取得
│   │                             - client.tsx: 全セクションの統合表示
│   │                             - error.tsx: 取得失敗時のエラー表示
│   └── api/
│       ├── portfolio/
│       │   └── route.ts        # GET: ポートフォリオデータ取得 API
│       │                         - GCS からの JSON データ取得
│       │                         - キャッシュヘッダー設定 (s-maxage=300)
│       └── contact/
│           └── route.ts        # POST: お問い合わせ送信 API
│                                 - リクエストバリデーション
│                                 - Resend 経由のメール送信
│
├── components/                 # Atomic Design に基づくコンポーネント構成
│   ├── atoms/                  # 最小単位の UI 部品
│   │   ├── Badge.tsx           # 状態を示す小さな印 (variant: accent/outline)
│   │   ├── Button.tsx          # ボタン (variant: primary/outline/ghost, size: sm/md/lg)
│   │   ├── Input.tsx           # テキスト入力 (label, error, hint 対応)
│   │   ├── TextArea.tsx        # テキストエリア (label, error, hint 対応)
│   │   └── ThemeToggle.tsx     # 配色テーマ切り替え (ボタン 2 個。§6.7)
│   ├── molecules/              # Atoms を組み合わせた複合部品
│   │   ├── CareerCard.tsx      # 経歴カード (期間, チーム規模, 技術スタック, フェーズ, 役割)
│   │   ├── ProductCard.tsx     # 個人開発カード (概要, 技術スタック, site / repo リンク)
│   │   ├── ArticleEntry.tsx    # 執筆記事の行 (タイトルリンク, 媒体・公開年月, 概要)
│   │   └── SocialLinks.tsx     # SNS リンク群 (名前のテキスト + 外部リンク)
│   └── organisms/              # 独立した機能単位のコンポーネント
│       ├── ContactForm.tsx     # お問い合わせフォーム (React Hook Form + Zod バリデーション)
│       └── Header.tsx          # ヘッダー (ナビゲーション, モバイルメニュー, テーマ切り替え)
│
├── hooks/                      # クライアントコンポーネントのロジック
│   └── useTheme.ts             # 配色テーマの適用と Cookie 保存 (§6.7)
│
├── repositories/               # 外部 I/O（fetch / 外部サービスクライアントはここだけ）
│   ├── gcs.ts                  # Google Cloud Storage クライアント (環境別認証設定)
│   ├── portfolio.ts            # データ取得ロジック (GCS取得 + ローカルフォールバック)
│   └── resend.ts               # Resend メールクライアント (HTML/テキスト両対応)
│
├── schemas/                    # Zod スキーマ（クライアント / サーバーで共有）
│   └── contact.ts              # ContactFormSchema・ContactFormInput
│
├── middleware.ts               # nonce ベース CSP の付与 (docs/06 §6.5)
│
├── lib/                        # 純粋ユーティリティ（通信しない）
│   ├── client-ip.ts            # クライアント IP の解決 (レートリミットのキー。docs/06 §10.2)
│   ├── custom-date.ts          # 日付ユーティリティ (「YYYY年MM月」→「YYYY/MM/01」変換)
│   ├── career-summary.ts       # 経歴の件数・技術数・開始年を算出 (Hero の数値帯)
│   ├── group-tech-stack.ts     # 技術スタックを 9 区分へ分類 (docs/05 §5.4)
│   ├── html-escape.ts          # HTML 出力エスケープ (HTMLメール本文への埋め込み用。docs/06 §8.1)
│   ├── logger.ts               # ログ出力方針の集約 (logError / logWarn / logDebug。docs/07 §7.2)
│   ├── mail-header.ts          # メールヘッダー値の無害化 (ヘッダーインジェクション対策。docs/06 §8.3)
│   ├── rate-limit.ts           # スライディングウィンドウのレートリミット (docs/06 §10)
│   ├── site-url.ts             # サイト公開 URL の解決 (metadataBase / canonical / sitemap / robots)
│   └── theme.ts                # 配色テーマ Cookie の検証と組み立て (§6.7)
│
├── constants/                  # 全環境で不変な値（環境変数は置かない）
│   ├── tech-categories.ts      # 技術名→分類の対応表と表示名 (docs/05 §5.4)
│   └── theme.ts                # 配色テーマ Cookie 名 (§6.7)
│
├── types/
│   ├── api-error.ts            # ApiErrorResponse (Route Handler の統一エラーレスポンス)
│   ├── tech-category.ts        # TechCategory と TECH_CATEGORIES (分類の union。docs/05 §5.4)
│   ├── theme.ts                # Theme と THEMES (配色テーマの union。§6.7)
│   └── portfolio.ts            # ポートフォリオデータ型定義
│                                 - PortfolioData (ルート型)
│                                 - NavbarData, HeroData, AboutData
│                                 - CareerTitleData, CareerData
│                                 - ContactData, FooterData
│                                 - ContactFormData, ContactFormErrors
│
└── utils/
    └── cn.ts                   # クラス名結合ユーティリティ (clsx + tailwind-merge)
```

---

## 4. コンポーネントアーキテクチャ

### 4.1 Atomic Design 階層

```text
┌─────────────────────────────────────────────────────────────┐
│                      Page (page.tsx)                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Organisms (独立機能単位)                    │  │
│  │                                                       │  │
│  │  ┌─────────────────┐   ┌─────────────────────────┐   │  │
│  │  │     Header      │   │     ContactForm          │   │  │
│  │  │  - ロゴ表示      │   │  - React Hook Form       │   │  │
│  │  │  - ナビゲーション │   │  - Zod バリデーション      │   │  │
│  │  │  - モバイルメニュー│   │  - API 通信              │   │  │
│  │  │  - ThemeToggle  │   │  - 送信状態管理           │   │  │
│  │  └─────────────────┘   └─────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Molecules (複合 UI 部品)                   │  │
│  │                                                       │  │
│  │  ┌─────────────────┐ ┌─────────────────┐            │  │
│  │  │   CareerCard    │ │   SocialLinks   │            │  │
│  │  │   - Badge       │ │   - テキストチップ│            │  │
│  │  │   - 分類チップ   │ │   - 外部リンク   │            │  │
│  │  └─────────────────┘ └─────────────────┘            │  │
│  │  ┌─────────────────┐ ┌─────────────────┐            │  │
│  │  │   ProductCard   │ │  ArticleEntry   │            │  │
│  │  │   - 技術チップ   │ │   - 罫線区切り   │            │  │
│  │  │   - 外部リンク   │ │   - 外部リンク   │            │  │
│  │  └─────────────────┘ └─────────────────┘            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Atoms (最小 UI 部品)                      │  │
│  │                                                       │  │
│  │  ┌────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │ Button │  │ Input  │  │ TextArea │  │  Badge   │  │  │
│  │  └────────┘  └────────┘  └──────────┘  └──────────┘  │  │
│  │  ┌─────────────┐                                     │  │
│  │  │ ThemeToggle │                                     │  │
│  │  └─────────────┘                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 コンポーネント依存関係

```text
page.tsx (Server Component)
└── HomeClient (client.tsx)
    ├── Header (organism)
    │   ├── ThemeToggle (atom)
    │   │   └── useTheme (hooks)
    │   └── cn (util)
    ├── CareerCard (molecule)
    │   ├── Badge (atom)
    │   ├── groupTechStack (lib)
    │   └── cn (util)
    ├── ProductCard (molecule)
    │   └── cn (util)
    ├── ArticleEntry (molecule)
    │   └── cn (util)
    ├── SocialLinks (molecule)
    │   └── cn (util)
    ├── ContactForm (organism)
    │   ├── Button (atom)
    │   ├── Input (atom)
    │   ├── TextArea (atom)
    │   ├── ContactFormSchema (schemas/contact)
    │   └── logDebug (lib/logger)
    ├── next/image
    ├── summarizeCareers (lib/career-summary)
    ├── toDateString (lib/custom-date)
    └── PortfolioData (types/portfolio)
```

> 本ツリーは issue #128 で実装から取り直した。`page.tsx` を頂点にした旧ツリーは server-first 化
> （issue #76）と刷新（issue #138）に追随しておらず、削除済みの Hero の `Button`、`SocialLinks` の
> `next/image` 依存、`ContactForm` 配下の重複行が残っていた。

### 4.3 コンポーネント設計原則

| 原則 | 実装方針 |
|------|---------|
| 単一責任 | 各コンポーネントは1つの明確な役割のみを担う |
| Props による制御 | スタイルバリエーション（variant, size）は Props で外部から制御する |
| ref フォワーディング | フォーム系 Atoms は `React.forwardRef` を使用し、React Hook Form と統合可能にする |
| className 拡張 | 全コンポーネントで `className` Props を受け取り、`cn()` でマージする |
| 型安全性 | 全 Props に TypeScript インターフェースを定義し、export する |

---

## 5. データフローアーキテクチャ

### 5.1 ポートフォリオデータ取得フロー

`page.tsx` は Server Component であり、データ取得はサーバー側で完結する。ブラウザは
完成した HTML を受け取るため、初期 HTML に全セクションの本文が含まれる。

```text
ブラウザ                  Cloud Run                  外部サービス
  │                         │                          │
  │  1. ページ読み込み        │                          │
  │─────────────────────────>│                          │
  │                         │                          │
  │                         │  2. page.tsx (Server)     │
  │                         │     getPortfolioDataServer()
  │                         │─────────────────────────>│
  │                         │                          │
  │                         │     [本番環境]             │
  │                         │     GCS からJSON取得       │
  │                         │                          │
  │                         │     [開発環境]             │
  │                         │     sample.json を読み込み  │
  │                         │     (存在する場合のみ。      │
  │                         │      リポジトリには未同梱)   │
  │                         │                          │
  │                         │  3. JSON データ返却        │
  │                         │<─────────────────────────│
  │                         │                          │
  │                         │  4. HomeClient を描画      │
  │                         │     (本文を含む HTML を生成) │
  │                         │                          │
  │  5. 本文入りの HTML       │                          │
  │<─────────────────────────│                          │
  │                         │                          │
  │  6. ハイドレーション       │                          │
  │  (モバイルメニュー等の      │                          │
  │   対話が有効になる)        │                          │
  │                         │                          │
```

**取得に失敗した場合**: `page.tsx` は例外を握りつぶさず伝播させ、`error.tsx` の
エラーバウンダリが描画される。握りつぶすと「本文が無いのに 200 が返る」状態になり、
検索エンジンに空ページとしてインデックスされうるため。

**`/api/portfolio` との関係**: 本ページは同エンドポイントを経由しない。エンドポイント自体は
BFF の公開 I/F として維持しており、仕様は `docs/07-api-specification.md` を参照。

> **旧構成（〜2026-09-19）**: `page.tsx` 全体が Client Component で、`useEffect` から
> `/api/portfolio` を fetch していた。そのため初期 HTML には `Loading...` の 10 文字しか
> 含まれず、JS を実行しないクローラからは本文が見えなかった。

### 5.2 お問い合わせ送信フロー

```text
ブラウザ                  Cloud Run                  外部サービス
  │                         │                          │
  │  1. フォーム入力          │                          │
  │  (React Hook Form で     │                          │
  │   送信時バリデーション)    │                          │
  │                         │                          │
  │  2. Zod スキーマ検証      │                          │
  │  (クライアント側)         │                          │
  │                         │                          │
  │  3. POST /api/contact    │                          │
  │  { name, email, message } │                          │
  │─────────────────────────>│                          │
  │                         │  4. サーバー側バリデーション  │
  │                         │  - 必須フィールドチェック     │
  │                         │  - メール形式チェック        │
  │                         │  - メッセージ長チェック      │
  │                         │    (最大5000文字)           │
  │                         │                          │
  │                         │  5. sendContactEmail()    │
  │                         │─────────────────────────>│
  │                         │     Resend API            │
  │                         │     - HTML メール送信       │
  │                         │     - テキストメール送信     │
  │                         │     - replyTo 設定         │
  │                         │<─────────────────────────│
  │                         │                          │
  │  6. 成功/失敗レスポンス   │                          │
  │<─────────────────────────│                          │
  │                         │                          │
  │  7. UI 状態更新           │                          │
  │  - 成功: 完了メッセージ    │                          │
  │  - 失敗: エラーメッセージ   │                          │
  │                         │                          │
```

### 5.3 データソース戦略

```text
┌─────────────────────────────────────────────────┐
│         repositories/portfolio.ts               │
│                                                 │
│  getPortfolioDataServer()                       │
│  │                                              │
│  ├─ [開発環境 && !FORCE_GCS && sample.json存在]   │
│  │   → sample.json を返却                        │
│  │                                              │
│  ├─ [それ以外]                                   │
│  │   → GCS から取得を試行                         │
│  │   │                                          │
│  │   ├─ [成功] → GCS データを返却                 │
│  │   │                                          │
│  │   └─ [失敗]                                   │
│  │       ├─ [開発環境 && sample.json存在]          │
│  │       │   → sample.json にフォールバック        │
│  │       └─ [本番環境]                            │
│  │           → Error をスロー                     │
│  │                                              │
└─────────────────────────────────────────────────┘
```

### 5.4 状態管理

本プロジェクトでは外部状態管理ライブラリ（Redux、Zustand 等）を使用せず、React の組み込み状態管理のみで構成している。

| 状態 | 管理箇所 | 管理方法 | 用途 |
|------|---------|---------|------|
| portfolioData | page.tsx | useState | API から取得したポートフォリオデータ |
| loading | page.tsx | useState | データ取得中のローディング状態 |
| prevVisibleCountRef | page.tsx | useRef | アニメーション制御用の前回表示件数 |
| isScrolled | Header.tsx | useState + useEffect | ヘッダースクロール状態 |
| isMobileMenuOpen | Header.tsx | useState | モバイルメニュー開閉状態 |
| isSubmitting | ContactForm.tsx | useState | フォーム送信中状態 |
| isSubmitted | ContactForm.tsx | useState | フォーム送信完了状態 |
| submitError | ContactForm.tsx | useState | フォーム送信エラー |
| form state | ContactForm.tsx | useForm (React Hook Form) | フォーム入力値・バリデーション状態 |

---

## 6. スタイリングアーキテクチャ

### 6.1 スタイリング技術構成

```text
┌────────────────────────────────────────────────────┐
│                 スタイリングレイヤー                    │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  globals.css                                 │  │
│  │  ├── @tailwind base       (リセット・基本スタイル) │  │
│  │  ├── @tailwind components (コンポーネントクラス)  │  │
│  │  ├── @tailwind utilities  (ユーティリティクラス)  │  │
│  │  ├── @layer base          (html, body 設定)    │  │
│  │  ├── @layer components    (section-heading 等) │  │
│  │  └── @layer utilities     (container, text系)  │  │
│  └──────────────────────────────────────────────┘  │
│                        │                           │
│  ┌──────────────────────────────────────────────┐  │
│  │  tailwind.config.js                          │  │
│  │  ├── 配色トークン (var(--*) を参照)             │  │
│  │  ├── カスタムフォント (明朝 / ゴシック)           │  │
│  │  └── カスタムアニメーション (fade-in-up のみ)     │  │
│  └──────────────────────────────────────────────┘  │
│                        │                           │
│  ┌──────────────────────────────────────────────┐  │
│  │  cn() ユーティリティ (clsx + tailwind-merge)  │  │
│  │  → コンポーネント内での動的クラス結合             │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### 6.2 配色トークン

**固定色のカラーパレットは廃止した**（issue #136 / #138）。`tailwind.config.js` の色はすべて CSS 変数を指す。

```js
colors: {
    paper: 'var(--paper)',
    ink: 'var(--ink)',
    // ... 全 11 トークン
}
```

**透過度の修飾子（`text-ink/50` 等）は使えない。** Tailwind が `rgb(var(--x) / <alpha-value>)` の形を要求するのに対し、トークンは hex / oklch の完成した色だからである。濃淡が要る箇所は専用トークンを足す。

トークンの定義・カスケード・実測コントラスト比は §6.7 と `docs/04-non-functional-specification.md` §5.2 を参照。

### 6.3 デザインシステム: 書類

**Glassmorphism（ガラスモーフィズム）を全廃した**（issue #135 / #138）。

旧デザインは半透明のガラス質とネオンの発光を基調としていたが、明るい環境のオフィスモニタで読みにくく、採用担当者に「何ができる人か」を伝えるという目的に対して装飾が勝っていた。現在は**職務経歴書（紙の書類）の作法**を基調とする。

| 要素 | 旧 | 現在 |
|------|-----|------|
| 面 | 半透明 + backdrop-blur | 不透明の地色（`--paper` / `--panel`） |
| 区切り | グラデーションの発光ライン | 1px のヘアライン（`--rule`） |
| 見出し | ネオングラデーション文字 | 明朝（Zen Old Mincho） |
| 角丸 | `rounded-xl` / `rounded-2xl` | `rounded-sm`（2px） |
| 影 | ネオン / ガラス影 | 使わない |
| 動き | 常時アニメーション多数 | 初回の `fade-in-up` のみ |

#### カスタムコンポーネントクラス

| クラス名 | 用途 |
|---------|------|
| `.section-heading` | 章見出し。タイトルと罫線を横並びにし、右端へ補助情報（件数など）を置く。**この罫線がセクションの区切りを兼ねる**ため、`<section>` 側に上罫を足さない（横罫が 2 本並ぶと、どちらが区切りか読めなくなる） |
| `.quote-panel` | 引用のように見せる面。Hero の要約と送信完了画面に使う |
| `.theme-toggle-light` / `.theme-toggle-dark` | テーマトグルの選択状態。配色トークンと同じ 4 ブロックのカスケードで決める（§6.7） |

#### カスタムユーティリティクラス

| クラス名 | 用途 |
|---------|------|
| `.container` | 本文幅 `max-w-4xl`（896px）。旧 `max-w-7xl`（1280px）から狭めた。1 行が長すぎると視線が行末から次の行頭へ戻れない |
| `.section-padding` | `py-8` / `lg:py-10`（32 / 40px）。上下が接するためセクション間の空きは 2 倍になる。セクション内の最大の空き（経歴カード間 40px）の 2 倍に揃えた（issue #145） |

### 6.4 アニメーション

| 名前 | 動作 | 時間 | 適用箇所 |
|------|------|------|---------|
| `fade-in-up` | opacity 0->1, translateY 12px->0 | 0.5s | Hero（初回表示の 1 回のみ） |

**常時動くアニメーションは持たない。** `prefers-reduced-motion: reduce` の環境では、アニメーション・トランジション・スムーススクロールをすべて無効化する（`globals.css`）。

### 6.5 影

**使わない。** 書類の質感に影は馴染まないため、`boxShadow` のカスタム定義（ネオン / ガラス）はすべて削除した。

### 6.6 フォントファミリー

| 用途 | フォント | 読み込み元 |
|------|---------|-----------|
| 見出し (serif) | Zen Old Mincho | Google Fonts (globals.css で @import) |
| 本文 (sans) | Zen Kaku Gothic New | Google Fonts (globals.css で @import) |
| 等幅 (mono) | ui-monospace, SFMono-Regular, Menlo | システムフォント（期間・件数・SNS 名に使用） |

英語見出し（`Solving Problems with Technology`）も明朝で組む。issue #135 の検討で、旧デザインのネオングラデーションより読みやすく品位が出ることを確認している。

**`next/font` は使わない。** 日本語のサブセット指定ができず全字形を取りに行くため。Google Fonts の CSS は unicode-range で字形を分割配信するので、実際に使う範囲だけが落ちてくる。`<head>` に `preconnect` を置いて接続を先に開く（`layout.tsx`）。

CSP は `style-src` に `https://fonts.googleapis.com`、`font-src` に `https://fonts.gstatic.com` を許可済み（§9 / `src/middleware.ts`）。書体の差し替えで CSP の変更は不要だった。

### 6.7 配色トークンとテーマ切替

デザイン刷新 (issue #135) の土台として、`globals.css` に配色トークンとライト / ダークの切替機構を定義し (issue #136)、全コンポーネントへ適用した (issue #138)。

**色はこのトークンを経由してのみ指定する。** `tailwind.config.js` は値を持たず `var(--*)` を参照するだけなので、配色を変えるときに触るのは `globals.css` のトークン定義に閉じる。色名を直書きしたクラス (`text-red-600` 等) は使わない。

> 定義 (#136) と適用 (#138) を別 PR に分けたのは、main への push が Cloud Run へ自動デプロイされるため、旧デザインと新デザインが混在した状態を本番へ出さないようにするため。

#### トークンの構造

値は `--light-*` / `--dark-*` に 1 度だけ定義し、4 つのブロックが公開トークン (`--paper` 等) へ写像する。

| ブロック | 役割 |
|----------|------|
| `:root` | 既定 (ライト) |
| `@media (prefers-color-scheme: dark) { :root }` | OS 設定がダークの場合 |
| `[data-theme='light']` | 利用者が明示的にライトを選んだ場合 |
| `[data-theme='dark']` | 利用者が明示的にダークを選んだ場合 |

`[data-theme]` と `:root` は詳細度が同じ (0,1,0) ため、**明示指定のブロックを後に書くことでのみ上書きできる**。順序を入れ替えると「ダークの OS でライトを選んでも戻らない」不具合になる。この並び順は `src/app/design-tokens.test.ts` が検証している。

CSS の `light-dark()` を使えば写像は 1 行で書けるが採用していない。未対応ブラウザではカスタムプロパティが計算値の時点で無効になり、`var()` を参照した側のプロパティごと落ちる (inherit / initial に化ける) ため。閲覧環境を選べない相手に出す画面では危険度が高い。

#### テーマの解決経路

```text
[初期表示]
ブラウザ ──(Cookie: theme=dark)──> layout.tsx (async / cookies())
                                      │ parseTheme() で検証
                                      ▼
                            <html data-theme="dark"> を初期 HTML に出力

[切り替え]
ThemeToggle (Client) ──> document.documentElement.dataset.theme = 'dark'  … 即座に反映
                    └──> document.cookie = serializeThemeCookie('dark')   … 次回以降に反映
```

- Cookie 名は `src/constants/theme.ts`、値の検証と Cookie 文字列の組み立ては `src/lib/theme.ts`
- Cookie は利用者が書き換えられる外部入力のため、`parseTheme()` で検証する。未設定・不正値は `null` を返し、`data-theme` を出力せずに OS 設定へ委ねる
- **サーバー側で解決するためテーマのちらつきが起きない**。クライアントで適用すると、一度ライトで描画してからダークへ切り替わる

#### `<html>` に載せる理由と、その代償

属性は `<html>` に出す必要がある。ラッパー要素に載せると `color-scheme` がブラウザ既定の部品 (スクロールバー・入力欄・オーバースクロール領域) へ効かず、OS がダークで利用者がライトを選んだ場合などに一部だけ色が食い違う。

その代償として、`layout.tsx` が `cookies()` を呼ぶことで**レイアウトを共有する 404 ページ (`_not-found`) も動的レンダリング (`ƒ`) になる**。issue #136 では静的のままにするため `page.tsx` 側で Cookie を読んでいたが、issue #138 で上記の理由から `layout.tsx` へ移した。404 に CSP が付かないことは変わらない (middleware のマッチャは `/` のみ)。

#### なぜインラインスクリプトを使わないか

ちらつき対策の定石は `<head>` 内で早期に `data-theme` を設定するインラインスクリプトだが、本プロジェクトの CSP は `script-src` を nonce + `strict-dynamic` で絞っており `'unsafe-inline'` を許可していない (§9 および `src/middleware.ts` 参照)。Cookie + サーバー解決なら**スクリプトが 1 行も不要**になるため、CSP と衝突しない。

なお `style-src` は `'unsafe-inline'` を許可しているが、これは Next.js が差し込むインラインスタイルのためであり、テーマ切替では使っていない。

#### なぜ `layout.tsx` ではなく `page.tsx` で読むか

`layout.tsx` で `cookies()` を呼ぶと、レイアウトを共有する 404 ページ (`_not-found`) まで動的レンダリングになる。**404 が静的プリレンダーされることは `e2e/security.spec.ts` が検証している不変条件**で、nonce ベース CSP のマッチャを `/` に限定している理由でもある。`page.tsx` は元から `force-dynamic` なので、ここで読む分には描画方式が変わらない。

ビルド出力で `/_not-found` が `○ (Static)` のままであることを確認すること。

---

## 7. デプロイアーキテクチャ

### 7.1 Cloud Run デプロイ構成

本番環境は GitHub Actions (`deploy_to_googlecloud.yml`) により Cloud Run にデプロイされる。

ワークフローは 4 本。

| ワークフロー | 契機 | 内容 |
|---|---|---|
| `ci.yml` | PR（main 宛） | 型チェック / ESLint / Prettier / actionlint / 依存監査 / UT / IT |
| `e2e.yml` | PR（main 宛） | Playwright（fake-gcs-server コンテナ） |
| `secret-scan.yml` | PR（main 宛）・main への push | 鍵・`.env` 系ファイルの追跡検出（docs/06 §11） |
| `deploy_to_googlecloud.yml` | main への push | Docker ビルド → Cloud Run デプロイ |

#### Node バージョンの統一

**`package.json` の `engines.node` を正本とする。**

| 層 | バージョン | 定義箇所 |
|---|---|---|
| 本番ランタイム | **24**（`node:24-alpine`） | `Dockerfile`（builder / runtime の 2 箇所） |
| CI / E2E | **24** | `.github/workflows/ci.yml` / `e2e.yml` |
| 型定義 | **24 系**（`@types/node@24.x`） | `package.json` |
| 宣言 | `>=24.0.0` | `package.json` の `engines.node` |

以前は本番 v18 / CI 24 / 型定義 26 相当と 3 層で食い違っており、**型チェックは通るが本番に存在しない API** を書けてしまう状態だった。しかも CI（24）でも再現しないため、本番でのみ落ちる（issue #130）。

下限を決めているのは **testcontainers（→ `undici@8`）の `node >= 22.19.0`** で、`next@16` の `>= 20.9.0` より厳しい。22 系でも要件は満たすが、CI が既に 24 で稼働していたため 24 に揃えた。

`@types/node` のメジャー更新は Dependabot の対象外にしている。自動で上がると上記の不整合に戻るため、Dockerfile と `engines.node` を上げるときに手動で揃える。

```text
┌─────────────────────────────────────────────────────────┐
│                Google Cloud Run (Docker)                  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Next.js サーバー (コンテナ)              │   │
│  │                                                  │   │
│  │  静的アセット + API Route を同一コンテナで配信       │   │
│  │  - HTML, CSS, JS バンドル                         │   │
│  │  - 画像ファイル (public/)                          │   │
│  │                                                  │   │
│  │  API Routes:                                     │   │
│  │  /api/portfolio (GET)                            │   │
│  │  └── @google-cloud/storage (ADC 認証)            │   │
│  │  └── Cache-Control: s-maxage=300                 │   │
│  │                                                  │   │
│  │  /api/contact (POST)                             │   │
│  │  └── resend                                      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  認証: ADC (サービスアカウント自動アタッチ)                │
│  公開: --allow-unauthenticated                           │
└─────────────────────────────────────────────────────────┘

CI/CD パイプライン:
  GitHub main push → GitHub Actions → Docker Build
  → Artifact Registry push → Cloud Run deploy
```

### 7.2 環境変数

| 変数名 | 必須 | 用途 | 使用箇所 |
|--------|------|------|---------|
| `GOOGLE_APPLICATION_CREDENTIALS` | 開発環境のみ | GCS サービスアカウントキーファイルパス | gcs.ts |
| `GOOGLE_CLOUD_PROJECT_ID` | 開発環境のみ | GCP プロジェクトID | gcs.ts |
| `GOOGLE_CLOUD_PRIVATE_KEY` | 実質未使用 | GCS サービスアカウント秘密鍵（`NODE_ENV` が `production`/`development` 以外の場合のみ到達するデッドコード分岐） | gcs.ts |
| `GOOGLE_CLOUD_CLIENT_EMAIL` | 実質未使用 | GCS サービスアカウントメール（同上） | gcs.ts |
| `GCS_PRIVATE_BUCKET_NAME` | 任意 | GCS バケット名（デフォルト: `intro_k_pri_bucket`） | gcs.ts |
| `GCS_JSON_PATH` | 任意 | GCS 内の JSON ファイルパス（デフォルト: `json/navbar_intro.json`） | gcs.ts |
| `GCS_API_ENDPOINT` | 任意（テスト用） | GCS の `apiEndpoint` 上書き。統合テストで fake-gcs-server エミュレータに接続するために使用（本番では未設定） | gcs.ts |
| `SITE_URL` | 任意 | サイトの公開 URL。メタデータ / canonical / sitemap / robots の基準（未設定時は `site-url.ts` の正規オリジン `https://introtechkkplus.com`） | site-url.ts |
| `RESEND_API_KEY` | 必須 | Resend API キー（`re_` プレフィックス） | resend.ts |
| `RESEND_FROM_EMAIL` | 必須 | メール送信元アドレス | resend.ts |
| `MY_MAIL_ADDRESS` | 必須 | お問い合わせメール受信先アドレス | resend.ts |
| `FORCE_GCS` | 任意 | 開発環境で GCS からの取得を強制する | repositories/portfolio.ts |
| `NODE_ENV` | 自動 | 実行環境（development/production） | 複数箇所 |

### 7.3 GCS 認証戦略

環境に応じて異なる認証方式を採用している。

```text

┌─────────────────────────────────────────────────────────┐
│                   GCS 認証フロー                          │
│                                                         │
│  NODE_ENV === 'production'                              │
│  └── ADC (Application Default Credentials)              │
│      → GCP 上での実行時は自動認証                         │
│                                                         │
│  NODE_ENV === 'development'                             │
│  ├── GOOGLE_APPLICATION_CREDENTIALS 設定時                │
│  │   └── keyFilename による認証                          │
│  └── GOOGLE_CLOUD_PROJECT_ID 設定時                      │
│      └── projectId を追加設定                             │
│                                                         │
│  else（NODE_ENV が production/development 以外の場合）    │
│  └── GOOGLE_CLOUD_PRIVATE_KEY によるJSON キー認証          │
│      ※ 通常運用ではデッドコード（到達しない分岐）           │
└─────────────────────────────────────────────────────────┘

```

---

### 7.4 カスタムドメイン構成

独自ドメイン `introtechkkplus.com` は **Cloudflare をレジストラ兼権威 DNS**、**Cloud Run をオリジン**とする構成で公開する。

```text

                    ┌──────────────────────────────┐
                    │  Cloudflare（権威 DNS）        │
                    │  NS: *.ns.cloudflare.com      │
                    └──────────────┬───────────────┘
                                   │ DNS only（プロキシ OFF）
          ┌────────────────────────┴────────────────────────┐
          │                                                 │
  introtechkkplus.com                          <www.introtechkkplus.com>
  A    216.239.32/34/36/38.21                  CNAME ghs.googlehosted.com.
  AAAA 2001:4860:4802:32/34/36/38::15
          │                                                 │
          └────────────────────────┬────────────────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │  Cloud Run ドメインマッピング  │
                    │  asia-northeast1              │
                    │  → nextjs-intro-ai-app-service│
                    └──────────────────────────────┘

```

#### DNS レコード

| ホスト | Type | 値 | Proxy |
|---|---|---|---|
| `@` | A | `216.239.32.21` / `216.239.34.21` / `216.239.36.21` / `216.239.38.21` | DNS only |
| `@` | AAAA | `2001:4860:4802:32::15` / `:34::15` / `:36::15` / `:38::15` | DNS only |
| `www` | CNAME | `ghs.googlehosted.com.` | DNS only |

apex（ゾーン頂点）に CNAME を置けないという DNS の制約により、apex は Google 固定 IP への A / AAAA、
`www` は CNAME という非対称な構成になる。レコード種別が異なるのは設定誤りではない。

#### apex と www の扱い

両方を Cloud Run にマッピングし、**リダイレクトは行わない**。同一内容が 2 つの URL で配信されるため、
重複コンテンツは `layout.tsx` の `alternates.canonical`（apex）と `robots.txt` の `Host` で正規化する。

#### 構築手順（runbook）

1. **Cloud Run ドメインマッピングを作成**（apex / www の 2 件）

   ```bash
   gcloud beta run domain-mappings create \
     --service=nextjs-intro-ai-app-service \
     --domain=introtechkkplus.com \
     --region=asia-northeast1 \
     --project=cobalt-list-386722
   ```

   `beta` コンポーネント未導入の場合は Cloud Run Admin API を直接呼ぶ:

   ```bash
   curl -X POST \
     -H "Authorization: Bearer $(gcloud auth print-access-token)" \
     -H "Content-Type: application/json" \
     -d '{"apiVersion":"domains.cloudrun.com/v1","kind":"DomainMapping",
          "metadata":{"name":"introtechkkplus.com","namespace":"cobalt-list-386722"},
          "spec":{"routeName":"nextjs-intro-ai-app-service"}}' \
     "https://asia-northeast1-run.googleapis.com/apis/domains.cloudrun.com/v1/namespaces/cobalt-list-386722/domainmappings"
   ```

2. **登録すべきレコードを取得**（`status.resourceRecords`）

   ```bash
   curl -s -H "Authorization: Bearer $(gcloud auth print-access-token)" \
     "https://asia-northeast1-run.googleapis.com/apis/domains.cloudrun.com/v1/namespaces/cobalt-list-386722/domainmappings/introtechkkplus.com"
   ```

3. **Cloudflare DNS に上表のレコードを登録する。必ず「DNS only（グレー雲）」にする。**

4. **証明書の発行を待つ**（通常 15 分〜1 時間、最大 24 時間）。
   `status.conditions[].CertificateProvisioned` が `True` になれば完了。

   ```bash
   dig +short introtechkkplus.com A
   curl -sI https://introtechkkplus.com/ | head -1
   ```

#### プロキシ（オレンジ雲）を最初は OFF にする理由

Cloud Run のドメインマッピングは Google が証明書を自動発行する。この検証はドメインへのアクセスが
Google に到達することを前提とするため、Cloudflare のプロキシが間に入ると発行されず
`Waiting for certificate provisioning` から進まない。

WAF・キャッシュを有効化したい場合は、**証明書発行完了後**にオレンジ雲へ切り替え、
SSL/TLS モードを **Full (strict)** に設定する（Flexible にすると Cloudflare〜Cloud Run 間が平文になり、
`security.md`「全通信は HTTPS を必須とする」に反する）。

#### Resend 送信元ドメインの検証

お問い合わせメールの送信元（`RESEND_FROM_EMAIL=noreply@introtechkkplus.com`）を使うには、
Resend ダッシュボードで `introtechkkplus.com` を登録し、提示される SPF / DKIM / DMARC の TXT レコードを
Cloudflare DNS に追加する。TXT レコードはプロキシの対象外のため、上記の Cloud Run 向け設定とは干渉しない。

#### 旧ドメインについて

旧ドメイン `introtechkk.com`（お名前.com）は失効済みで、ネームサーバーが `*.onamae-expired.com` を指している。
Cloud Run 側のドメインマッピングは削除済み。

---

## 8. ビルド・開発設定

### 8.1 Next.js 設定 (`next.config.js`)

| 設定項目 | 値 | 目的 |
|---------|-----|------|
| `images.unoptimized` | `true` | Cloud Run (非 Vercel) 環境でも画像を表示可能にする（GCS 上の外部画像対応） |
| `experimental.typedRoutes` | `true` | ルーティングの型安全性を有効化 |
| `webpack.resolve.fallback` | Node.js モジュールを `false` に設定 | クライアントサイドバンドルから Node.js 専用モジュールを除外 |

除外対象の Node.js モジュール: `fs`, `net`, `tls`, `crypto`, `stream`, `url`, `zlib`, `http`, `https`, `assert`, `os`, `path`, `child_process`

### 8.2 TypeScript 設定 (`tsconfig.json`)

| 設定項目 | 値 | 目的 |
|---------|-----|------|
| `target` | `es5` | 広範なブラウザ互換性の確保 |
| `lib` | `["dom", "dom.iterable", "es6"]` | DOM API とES6機能の型サポート |
| `strict` | `true` | 厳密な型チェックの有効化 |
| `module` | `esnext` | ES モジュール構文の使用 |
| `moduleResolution` | `bundler` | バンドラーに最適化されたモジュール解決 |
| `jsx` | `preserve` | Next.js による JSX 変換に委譲 |
| `paths.@/*` | `["./src/*"]` | `@/` エイリアスによるインポートパス短縮 |
| `incremental` | `true` | インクリメンタルビルドの有効化 |
| `resolveJsonModule` | `true` | JSON ファイルの import を許可（sample.json 読み込み用） |

### 8.3 開発スクリプト

| スクリプト | コマンド | 用途 |
|-----------|---------|------|
| `dev` | `next dev` | 開発サーバー起動（ホットリロード対応） |
| `build` | `next build` | 本番ビルド |
| `start` | `next start` | 本番サーバー起動 |
| `lint` | `eslint .` | ESLint によるコード品質チェック（flat config） |
| `format` | `prettier --write .` | Prettier によるコードフォーマット |
| `format:check` | `prettier --check .` | フォーマット準拠チェック（CI 用） |
| `type-check` | `tsc --noEmit` | TypeScript 型チェック（ファイル出力なし） |

### 8.4 ビルドパイプライン

```text
ソースコード
  │
  ├── 1. TypeScript 型チェック (tsc --noEmit)
  │     └── strict モード、エイリアスパス解決
  │
  ├── 2. ESLint チェック (eslint .)
  │     └── Next.js 推奨ルール + TypeScript ルール
  │
  ├── 3. Prettier チェック (prettier --check .)
  │     └── コードスタイル一貫性の検証
  │
  └── 4. Next.js ビルド (next build)
        ├── TypeScript コンパイル
        ├── Tailwind CSS パージ・ビルド
        │   └── PostCSS → Autoprefixer
        ├── React コンポーネントバンドル
        ├── 静的ページ生成 (layout.tsx のメタデータ)
        ├── API Routes のサーバーレス関数パッケージング
        └── Webpack バンドル最適化
              └── クライアント: Node.js モジュール除外
```

---

## 9. セキュリティアーキテクチャ

### 9.1 セキュリティ対策

| 対策 | 実装箇所 | 詳細 |
|------|---------|------|
| 環境変数による機密情報管理 | 全外部サービス接続 | API キー、認証情報は環境変数で管理（ソースコードに含めない） |
| サーバーサイドバリデーション | /api/contact | 必須フィールド、メール形式、メッセージ長の検証 |
| クライアントサイドバリデーション | ContactForm | Zod スキーマによる送信時バリデーション（`useForm` のデフォルト `mode: 'onSubmit'`） |
| 二重バリデーション | フォーム送信フロー | クライアントの Zod + サーバーの手動バリデーションの二段構え |
| XSS 対策 | React デフォルト | React の JSX エスケープ機能による自動対策 |
| CSRF 対策 | Next.js デフォルト | API Routes の SameSite Cookie によるデフォルト保護 |
| Node.js モジュール除外 | next.config.js | クライアントバンドルからサーバー専用モジュールを除外 |
| 外部リンク安全性 | SocialLinks / ProductCard / ArticleEntry | `rel="noopener noreferrer"` の設定 |
| 開発環境ログ制限 | resend.ts, contact/route.ts | `NODE_ENV === 'development'` の場合のみ詳細ログを出力 |

### 9.2 入力バリデーション層

```text
ユーザー入力
  │
  ├── 第1層: クライアントサイドバリデーション
  │   └── Zod スキーマ (ContactFormSchema)
  │       ├── name: 2-50文字
  │       ├── email: メール形式、1-255文字
  │       └── message: 10-2000文字
  │
  └── 第2層: サーバーサイドバリデーション
      └── API Route (/api/contact)
          ├── name: 必須チェック
          ├── email: 必須 + 正規表現パターンチェック
          └── message: 必須 + 5000文字以内チェック
```

> 注: クライアント側（Zod）とサーバー側の文字数制限に差異がある。クライアント側は message を最大 2000 文字、サーバー側は最大 5000 文字としている。サーバー側がより緩い制限であるため、クライアント側の制限が実質的な上限として機能する。

---

## 10. 型定義アーキテクチャ

### 10.1 PortfolioData 型階層

```text
PortfolioData
├── navbar_data: NavbarData
│   ├── link_title: string
│   ├── about_name: string
│   ├── career_name: string
│   └── contact_name: string
│
├── hero_data: HeroData
│   └── hero_img_url: string
│
├── about_data: AboutData
│   ├── about_name: string
│   ├── about_icon_url: string
│   ├── about_img_url: string
│   ├── sns_list: SNSItem[]
│   │   ├── sns_name: string
│   │   ├── sns_url: string
│   │   └── sns_img: string
│   └── about_contents: string[]
│
├── career_title_data: CareerTitleData    ※ UIで未使用（ラベルはCareerCard.tsxでハードコード）
│   ├── career_title_period: string
│   ├── career_title_member: string
│   ├── career_title_contents: string
│   ├── career_title_stack: string
│   ├── career_title_phase: string
│   └── career_title_role: string
│
├── product_data: ProductData
│   ├── product_description: string
│   └── product_items: ProductItem[]
│       ├── product_title: string
│       ├── product_contents: string
│       ├── product_site_url: string      ※ 空文字ならリンクを描画しない
│       ├── product_repo_url: string      ※ 空文字ならリンクを描画しない
│       └── product_skill_stack: string[]
│
├── article_data: ArticleData
│   ├── article_description: string
│   └── article_items: ArticleItem[]
│       ├── article_title: string
│       ├── article_url: string            ※ 空文字ならリンクにしない
│       ├── article_platform: string
│       ├── article_published_at: string
│       └── article_contents: string
│
├── career_data: CareerData[]
│   ├── career_title: string
│   ├── career_start: string         ("YYYY年MM月" 形式)
│   ├── career_end: string           ("YYYY年MM月" 形式 or "now")
│   ├── career_member: string
│   ├── career_contents: string
│   ├── career_skill_stack: string[]
│   ├── career_skill_phase: string[]
│   └── career_role: string
│
│
├── contact_data: ContactData             ※ UIで未使用（見出し・ボタン文言はpage.tsx/ContactForm.tsxでハードコード）
│   ├── contact_name: string
│   ├── contact_email: string
│   ├── contact_contents: string
│   └── contact_btn_name: string
│
└── footer_data: FooterData
    └── copyright: string
```

### 10.2 フォーム関連型

```text
ContactFormSchema (Zod スキーマ)
└── infer → ContactFormInput
    ├── name: string
    ├── email: string
    └── message: string

ContactFormData (手動型定義)
├── name: string
├── email: string
└── message: string

ContactFormErrors (手動型定義)
├── name?: string
├── email?: string
└── message?: string
```

---

## 11. SEO・メタデータアーキテクチャ

### 11.1 メタデータ設定 (`layout.tsx`)

| メタデータ | 設定値 |
|-----------|--------|
| metadataBase | `getSiteUrl()`（`SITE_URL` → 未設定時は `https://introtechkkplus.com`） |
| canonical | `/`（`metadataBase` 基準で絶対 URL に解決） |
| title | `TechProfile Pro - フリーランスエンジニア` |
| description | `フリーランスエンジニアのポートフォリオサイト` |
| keywords | フリーランスエンジニア, Java, TypeScript, Next.js, バックエンド開発, システム開発 |
| lang | `ja` |
| OGP url | `/`（`metadataBase` 基準で絶対 URL に解決） |
| OGP type | `website` |
| OGP locale | `ja_JP` |
| Twitter card | `summary_large_image` |
| robots | index: true, follow: true |
| googleBot | max-video-preview: -1, max-image-preview: large, max-snippet: -1 |

### 11.2 アクセシビリティ対応

| 対応項目 | 実装箇所 |
|---------|---------|
| 言語宣言 | `<html lang="ja">` |
| 画像代替テキスト | 全 `Image` コンポーネントに `alt` 属性 |
| フォームラベル | `Input`, `TextArea` の `label` Props |
| 必須マーク | `required` 時の赤い `*` 表示 |
| キーボードアクセス | ボタン要素の `focus-visible` リング |
| SNS リンク | `aria-label` 属性の設定 |
| モバイルメニュー | `aria-label="メニューを開く"` |
| スムーススクロール | `scroll-behavior: smooth` (CSS) |
