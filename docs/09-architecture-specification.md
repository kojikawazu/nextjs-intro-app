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
    - [6.2 カスタムカラーシステム](#62-カスタムカラーシステム)
    - [6.3 デザインシステム: Glassmorphism](#63-デザインシステム-glassmorphism)
        - [カスタムコンポーネントクラス](#カスタムコンポーネントクラス)
        - [カスタムユーティリティクラス](#カスタムユーティリティクラス)
    - [6.4 カスタムアニメーション](#64-カスタムアニメーション)
    - [6.5 カスタムボックスシャドウ](#65-カスタムボックスシャドウ)
    - [6.6 フォントファミリー](#66-フォントファミリー)
- [7. デプロイアーキテクチャ](#7-デプロイアーキテクチャ)
    - [7.1 Cloud Run デプロイ構成](#71-cloud-run-デプロイ構成)

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

```
┌─────────────────────────────────────────────────────────────────┐
│                        クライアント（ブラウザ）                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   page.tsx ('use client')                 │  │
│  │                                                           │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Hero   │  │  About   │  │  Career  │  │  Skills   │  │  │
│  │  │ Section │  │ Section  │  │ Section  │  │ Section   │  │  │
│  │  └─────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  │  ┌─────────┐  ┌──────────┐                               │  │
│  │  │ Contact │  │  Footer  │                               │  │
│  │  │ Section │  │          │                               │  │
│  │  └─────────┘  └──────────┘                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│          │ useEffect: fetch()              │ POST                │
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
| Repository パターン（簡易） | lib/data-server.ts | データソースの抽象化（GCS / ローカルファイルのフォールバック） |

---

## 2. 技術スタック

### 2.1 ランタイム依存パッケージ

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| next | 14.2.5 | React フレームワーク (App Router) |
| react | 18.3.1 | UI ライブラリ |
| react-dom | 18.3.1 | React DOM レンダラー |
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
| @types/node | 20.14.8 | Node.js 型定義 |
| @types/react | 18.3.3 | React 型定義 |
| @types/react-dom | 18.3.0 | React DOM 型定義 |
| tailwindcss | 3.4.4 | ユーティリティファースト CSS フレームワーク |
| postcss | 8.4.38 | CSS 変換ツール |
| autoprefixer | 10.4.19 | ベンダープレフィックス自動付与 |
| eslint | 8.57.0 | JavaScript/TypeScript リンター |
| eslint-config-next | 14.2.5 | Next.js 用 ESLint 設定 |
| @typescript-eslint/eslint-plugin | ^7.18.0 | TypeScript ESLint プラグイン |
| @typescript-eslint/parser | ^7.18.0 | TypeScript ESLint パーサー |
| eslint-plugin-jsdoc | ^48.11.0 | JSDoc（TSDoc）コメントの静的検査（`src/**` の TS/TSX 対象。ESLint 8 互換のため v48 系を採用） |
| prettier | ^3.3.2 | コードフォーマッター |
| vitest | ^4.1.10 | テストランナー（ユニットテスト） |
| @vitest/coverage-v8 | ^4.1.10 | カバレッジ計測（v8 プロバイダ） |
| @testing-library/react | ^16.3.2 | React コンポーネントの描画・操作テスト（コンポーネントテスト導入時に使用） |
| @testing-library/jest-dom | ^6.9.1 | DOM アサーションマッチャー拡張 |
| @testing-library/user-event | ^14.6.1 | ユーザー操作のシミュレーション |
| jsdom | ^29.1.1 | テスト実行時のブラウザ環境エミュレーション |
| testcontainers | ^12.0.4 | 統合テストで fake-gcs-server コンテナを起動（要 Docker） |
| msw | ^2.15.0 | 統合テストで Resend の HTTP をモック |

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

```
nextjs-intro-app/
├── .next/                      # Next.js ビルド出力（git 管理外）
├── docs/                       # プロジェクトドキュメント
├── node_modules/               # pnpm パッケージ（git 管理外）
├── public/                     # 静的ファイル配信ディレクトリ
├── src/                        # アプリケーションソースコード
│   ├── app/                    # Next.js App Router
│   ├── components/             # UI コンポーネント
│   ├── lib/                    # サーバーサイドライブラリ・外部サービスクライアント
│   ├── types/                  # TypeScript 型定義
│   └── utils/                  # クライアントサイドユーティリティ
├── .eslintrc.json              # ESLint 設定
├── .gitignore                  # Git 除外設定
├── .prettierrc                 # Prettier 設定
├── next.config.js              # Next.js 設定
├── package.json                # プロジェクト定義・依存関係
├── postcss.config.js           # PostCSS 設定
├── tailwind.config.js          # Tailwind CSS 設定
└── tsconfig.json               # TypeScript 設定
```

### 3.2 src ディレクトリ詳細

```
src/
├── app/                        # Next.js App Router ディレクトリ
│   ├── globals.css             # グローバルスタイル定義
│   │                             - Tailwind ディレクティブ (@tailwind)
│   │                             - Web フォント読み込み (Inter, Noto Sans JP)
│   │                             - カスタムコンポーネントクラス (glass-effect, neon-text 等)
│   │                             - カスタムユーティリティクラス (container, section-padding 等)
│   ├── layout.tsx              # ルートレイアウト
│   │                             - HTML メタデータ設定 (OGP, Twitter Card, SEO)
│   │                             - html lang="ja" 設定
│   ├── page.tsx                # ホームページ（クライアントコンポーネント）
│   │                             - データフェッチ (useEffect + fetch)
│   │                             - 全セクションの統合表示
│   │                             - ローディング/エラー状態管理
│   │                             - スキル表示のページネーション管理
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
│   │   ├── Badge.tsx           # バッジ (variant: default/secondary/accent/outline, size: sm/md)
│   │   ├── Button.tsx          # ボタン (variant: primary/secondary/outline/ghost, size: sm/md/lg)
│   │   ├── Input.tsx           # テキスト入力 (label, error, hint 対応)
│   │   └── TextArea.tsx        # テキストエリア (label, error, hint 対応)
│   ├── molecules/              # Atoms を組み合わせた複合部品
│   │   ├── CareerCard.tsx      # 経歴カード (期間, チーム規模, 技術スタック, フェーズ, 役割)
│   │   ├── SkillCard.tsx       # スキルカード (アイコン, 名前, 説明)
│   │   └── SocialLinks.tsx     # SNS リンク群 (アイコン画像 + 外部リンク)
│   └── organisms/              # 独立した機能単位のコンポーネント
│       ├── ContactForm.tsx     # お問い合わせフォーム (React Hook Form + Zod バリデーション)
│       └── Header.tsx          # ヘッダー (ナビゲーション, モバイルメニュー, スクロール検知)
│
├── lib/                        # サーバーサイド専用ライブラリ
│   ├── costom-date.ts          # 日付ユーティリティ (「YYYY年MM月」→「YYYY/MM/01」変換)
│   ├── data-server.ts          # データ取得ロジック (GCS取得 + ローカルフォールバック)
│   ├── gcs.ts                  # Google Cloud Storage クライアント (環境別認証設定)
│   └── resend.ts               # Resend メールクライアント (HTML/テキスト両対応)
│
├── types/
│   └── portfolio.ts            # ポートフォリオデータ型定義
│                                 - PortfolioData (ルート型)
│                                 - NavbarData, HeroData, AboutData
│                                 - CareerTitleData, CareerData
│                                 - SkillsData, SkillCard
│                                 - ContactData, FooterData
│                                 - ContactFormData, ContactFormErrors
│
└── utils/
    ├── cn.ts                   # クラス名結合ユーティリティ (clsx + tailwind-merge)
    └── validation.ts           # Zod バリデーションスキーマ (ContactFormSchema)
```

---

## 4. コンポーネントアーキテクチャ

### 4.1 Atomic Design 階層

```
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
│  │  │  - スクロール検知  │   │  - 送信状態管理           │   │  │
│  │  └─────────────────┘   └─────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Molecules (複合 UI 部品)                   │  │
│  │                                                       │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌────────────────┐  │  │
│  │  │  SkillCard  │ │ CareerCard  │ │  SocialLinks   │  │  │
│  │  │  - Image    │ │ - Badge     │ │  - Image       │  │  │
│  │  │  - テキスト  │ │ - テキスト   │ │  - 外部リンク   │  │  │
│  │  └─────────────┘ └─────────────┘ └────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Atoms (最小 UI 部品)                      │  │
│  │                                                       │  │
│  │  ┌────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │ Button │  │ Input  │  │ TextArea │  │  Badge   │  │  │
│  │  └────────┘  └────────┘  └──────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 コンポーネント依存関係

```
page.tsx
├── Header (organism)
│   └── cn (util)
├── ContactForm (organism)
│   ├── Button (atom)
│   ├── Input (atom)
│   ├── TextArea (atom)
│   ├── ContactFormSchema (util/validation)
│   └── cn (util)
├── SkillCard (molecule)
│   ├── next/image
│   └── cn (util)
├── CareerCard (molecule)
│   ├── Badge (atom)
│   └── cn (util)
├── SocialLinks (molecule)
│   ├── next/image
│   └── cn (util)
├── Button (atom)
├── toDateString (lib/costom-date)
└── PortfolioData (types/portfolio)
```

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

```
ブラウザ                  Cloud Run                  外部サービス
  │                         │                          │
  │  1. ページ読み込み        │                          │
  │─────────────────────────>│                          │
  │                         │                          │
  │  2. page.tsx レンダリング  │                          │
  │  (useEffect 実行)        │                          │
  │                         │                          │
  │  3. GET /api/portfolio   │                          │
  │─────────────────────────>│                          │
  │                         │  4. getPortfolioDataServer()
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
  │                         │  5. JSON データ返却        │
  │                         │<─────────────────────────│
  │                         │                          │
  │  6. JSON レスポンス       │                          │
  │  (Cache-Control:         │                          │
  │   s-maxage=300)          │                          │
  │<─────────────────────────│                          │
  │                         │                          │
  │  7. setState(data)       │                          │
  │  8. UI 再レンダリング     │                          │
  │                         │                          │
```

### 5.2 お問い合わせ送信フロー

```
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

```
┌─────────────────────────────────────────────────┐
│             data-server.ts                      │
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
| visibleSkillsCount | page.tsx | useState | スキルカードの表示件数 |
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

```
┌────────────────────────────────────────────────────┐
│                 スタイリングレイヤー                    │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  globals.css                                 │  │
│  │  ├── @tailwind base       (リセット・基本スタイル) │  │
│  │  ├── @tailwind components (コンポーネントクラス)  │  │
│  │  ├── @tailwind utilities  (ユーティリティクラス)  │  │
│  │  ├── @layer base          (html, body 設定)    │  │
│  │  ├── @layer components    (glass系, neon系)    │  │
│  │  └── @layer utilities     (container, text系)  │  │
│  └──────────────────────────────────────────────┘  │
│                        │                           │
│  ┌──────────────────────────────────────────────┐  │
│  │  tailwind.config.js                          │  │
│  │  ├── カスタムカラーパレット                      │  │
│  │  ├── カスタムフォント                           │  │
│  │  ├── カスタムアニメーション                      │  │
│  │  └── カスタムボックスシャドウ                     │  │
│  └──────────────────────────────────────────────┘  │
│                        │                           │
│  ┌──────────────────────────────────────────────┐  │
│  │  cn() ユーティリティ (clsx + tailwind-merge)  │  │
│  │  → コンポーネント内での動的クラス結合             │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### 6.2 カスタムカラーシステム

4つのカラーパレットを各10段階（50-950）で定義している。

| カラー名 | ベースカラー | 主な用途 |
|---------|------------|---------|
| primary | スカイブルー (#0ea5e9 / 500) | メインアクセント、リンク、フォーカスリング、ネオンエフェクト |
| secondary | スレート (#64748b / 500) | 背景、テキスト、ボーダー、サーフェス |
| accent | グリーン (#22c55e / 500) | 成功状態、「現在」バッジ、アクセント要素 |
| purple | パープル (#a855f7 / 500) | グラデーション終点、タイムライン、フェーズバッジ |

### 6.3 デザインシステム: Glassmorphism

本プロジェクトのデザインは Glassmorphism（ガラスモーフィズム）を基調としている。

#### カスタムコンポーネントクラス

| クラス名 | 定義 | 用途 |
|---------|------|------|
| `glass-effect` | `bg-white/10 backdrop-blur-md border border-white/20` | 標準的なガラスエフェクト（ヘッダー、入力フィールド、ボタン） |
| `glass-card` | `bg-white/5 backdrop-blur-xl border border-white/10 shadow-glass` | カード要素用の深いガラスエフェクト |
| `neon-text` | `text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400` + text-shadow | ネオン発光テキスト（セクション見出し、ロゴ） |
| `floating-card` | `hover:scale-[1.02] hover:shadow-glass-lg hover:-translate-y-1` | ホバー時の浮き上がりエフェクト |
| `animated-bg` | 4色グラデーション + `gradientShift` アニメーション (15秒) | Hero セクション背景のゆらぎ |
| `mesh-background` | 3つの `radial-gradient` の重ね合わせ | 各セクションの装飾背景 |
| `particle-bg` | 5つの小さな `radial-gradient` ドットの繰り返し | パーティクル風の背景装飾 |

#### カスタムユーティリティクラス

| クラス名 | 定義 | 用途 |
|---------|------|------|
| `container` | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | コンテンツ幅の制約 |
| `section-padding` | `py-20 lg:py-32` | セクション間の余白 |
| `text-gradient` | `bg-gradient-to-r from-primary-400 via-purple-400 to-accent-400 bg-clip-text text-transparent` | 3色グラデーションテキスト |
| `hover-lift` | `hover:-translate-y-2 hover:shadow-2xl` | ホバー時の浮上エフェクト |
| `glow-on-hover` | `hover:shadow-neon hover:scale-105` | ホバー時のネオン発光 |

### 6.4 カスタムアニメーション

| アニメーション名 | キーフレーム | 持続時間 | 用途 |
|----------------|------------|---------|------|
| `fade-in-up` | 0%: opacity:0, translateY(40px) → 100%: opacity:1, translateY(0) | 0.8s ease-out | セクション表示時のフェードイン |
| `fade-in-down` | 0%: opacity:0, translateY(-40px) → 100%: opacity:1, translateY(0) | 0.8s ease-out | 上からのフェードイン |
| `fade-in` | 0%: opacity:0 → 100%: opacity:1 | 0.6s ease-out | シンプルなフェードイン |
| `slide-in-left` | 0%: opacity:0, translateX(-50px) → 100%: opacity:1, translateX(0) | 0.8s ease-out | 左からのスライドイン |
| `slide-in-right` | 0%: opacity:0, translateX(50px) → 100%: opacity:1, translateX(0) | 0.8s ease-out | 右からのスライドイン |
| `float` | 0%,100%: translateY(0) → 50%: translateY(-20px) | 6s ease-in-out infinite | Hero ボタンの浮遊アニメーション |
| `glow` | 0%: shadow 5px → 100%: shadow 20px+30px | 2s ease-in-out infinite alternate | ネオン発光の明滅 |
| `gradientShift` | background-position の循環 | 15s ease infinite | Hero 背景グラデーションの移動 |

### 6.5 カスタムボックスシャドウ

| シャドウ名 | 値 | 用途 |
|-----------|-----|------|
| `glass` | `0 8px 32px 0 rgba(31, 38, 135, 0.37)` | glass-card のデフォルトシャドウ |
| `glass-lg` | `0 25px 45px rgba(31, 38, 135, 0.25)` | ホバー時の強調シャドウ |
| `neon` | primary-400 の 5px + 20px + 35px 三重シャドウ | ネオン発光エフェクト |
| `neon-sm` | primary-400 の 10px シャドウ | 小さなネオン発光 |

### 6.6 フォントファミリー

| 用途 | フォント | 読み込み元 |
|------|---------|-----------|
| 本文 (sans) | Inter, Noto Sans JP, sans-serif | Google Fonts (globals.css で @import) |
| コード (mono) | JetBrains Mono, Fira Code, monospace | tailwind.config.js で定義（現時点で未使用） |

---

## 7. デプロイアーキテクチャ

### 7.1 Cloud Run デプロイ構成

本番環境は GitHub Actions (`deploy_to_googlecloud.yml`) により Cloud Run にデプロイされる。

```
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
| `RESEND_API_KEY` | 必須 | Resend API キー（`re_` プレフィックス） | resend.ts |
| `RESEND_FROM_EMAIL` | 必須 | メール送信元アドレス | resend.ts |
| `MY_MAIL_ADDRESS` | 必須 | お問い合わせメール受信先アドレス | resend.ts |
| `FORCE_GCS` | 任意 | 開発環境で GCS からの取得を強制する | data-server.ts |
| `NODE_ENV` | 自動 | 実行環境（development/production） | 複数箇所 |

### 7.3 GCS 認証戦略

環境に応じて異なる認証方式を採用している。

```
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
| `lint` | `next lint` | ESLint によるコード品質チェック |
| `format` | `prettier --write .` | Prettier によるコードフォーマット |
| `format:check` | `prettier --check .` | フォーマット準拠チェック（CI 用） |
| `type-check` | `tsc --noEmit` | TypeScript 型チェック（ファイル出力なし） |

### 8.4 ビルドパイプライン

```
ソースコード
  │
  ├── 1. TypeScript 型チェック (tsc --noEmit)
  │     └── strict モード、エイリアスパス解決
  │
  ├── 2. ESLint チェック (next lint)
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
| 外部リンク安全性 | SocialLinks | `rel="noopener noreferrer"` の設定 |
| 開発環境ログ制限 | resend.ts, contact/route.ts | `NODE_ENV === 'development'` の場合のみ詳細ログを出力 |

### 9.2 入力バリデーション層

```
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

```
PortfolioData
├── navbar_data: NavbarData
│   ├── link_title: string
│   ├── about_name: string
│   ├── career_name: string
│   ├── skills_name: string
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
├── skills_data: SkillsData
│   ├── skills_cards: SkillCard[]
│   │   ├── skills_card_icon: string
│   │   ├── skills_card_name: string
│   │   └── skills_card_contents: string
│   └── skills_more: string
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

```
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
| title | `TechProfile Pro - フリーランスエンジニア` |
| description | `フリーランスエンジニアのポートフォリオサイト` |
| keywords | フリーランスエンジニア, Java, TypeScript, Next.js, バックエンド開発, システム開発 |
| lang | `ja` |
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
