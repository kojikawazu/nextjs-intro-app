# その他仕様書 - TechProfile Pro

| 項目 | 内容 |
|------|------|
| プロジェクト名 | TechProfile Pro |
| バージョン | 1.0.0 |
| 作成日 | 2026-03-20 |
| ステータス | 運用中 |

---

## 目次

- [1. 用語集（Glossary）](#1-用語集glossary)
- [2. 外部参照・ドキュメントリンク](#2-外部参照ドキュメントリンク)
    - [2.1 フレームワーク・ライブラリ](#21-フレームワークライブラリ)
    - [2.2 開発ツール](#22-開発ツール)
    - [2.3 インフラ・サービス](#23-インフラサービス)
- [3. 開発環境セットアップガイド](#3-開発環境セットアップガイド)
    - [3.1 前提条件](#31-前提条件)
    - [3.2 初期セットアップ](#32-初期セットアップ)
    - [3.3 環境変数](#33-環境変数)
    - [3.4 ローカル開発（GCSなし）](#34-ローカル開発gcsなし)
    - [3.5 利用可能なスクリプト](#35-利用可能なスクリプト)
- [4. コーディング規約](#4-コーディング規約)
    - [4.1 TypeScript 規約](#41-typescript-規約)
    - [4.2 コードフォーマット（Prettier）](#42-コードフォーマットprettier)
    - [4.3 コンポーネント命名規則](#43-コンポーネント命名規則)
    - [4.4 ファイル構成規則](#44-ファイル構成規則)
    - [4.5 コンポーネント実装パターン](#45-コンポーネント実装パターン)
    - [4.6 CSS / スタイル規約](#46-css--スタイル規約)
- [5. Git ワークフロー・ブランチ戦略](#5-git-ワークフローブランチ戦略)
    - [5.1 ブランチ構成](#51-ブランチ構成)
    - [5.2 開発フロー](#52-開発フロー)
    - [5.3 コミットメッセージ](#53-コミットメッセージ)
    - [5.4 CI/CD パイプライン](#54-cicd-パイプライン)
- [6. 既知の問題と制限事項](#6-既知の問題と制限事項)
    - [6.1 既知の問題](#61-既知の問題)
    - [6.2 機能的な制限事項](#62-機能的な制限事項)
    - [6.3 ブラウザサポート](#63-ブラウザサポート)
- [7. セキュリティ考慮事項](#7-セキュリティ考慮事項)
- [8. パフォーマンス指標](#8-パフォーマンス指標)

---

## 1. 用語集（Glossary）

本プロジェクトで使用される技術用語・略語の定義を以下にまとめる。

| 用語 | 正式名称 | 説明 |
|------|----------|------|
| GCS | Google Cloud Storage | Google Cloud が提供するオブジェクトストレージサービス。本プロジェクトではポートフォリオデータ（JSON）をプライベートバケットに格納し、サーバーサイドから取得する。 |
| ADC | Application Default Credentials | Google Cloud の認証メカニズム。本番環境（Cloud Run）では自動的にサービスアカウント認証が適用される。 |
| ISR | Incremental Static Regeneration | Next.js の機能で、静的ページをバックグラウンドで再生成する仕組み。要件として言及されているが、現在は API Route + クライアントフェッチ方式を採用。 |
| SPA | Single Page Application | 単一ページで動作するWebアプリケーション。ページ遷移なしに動的なコンテンツ切り替えを実現する。本プロジェクトはSPA形式のポートフォリオサイト。 |
| App Router | Next.js App Router | Next.js 13以降で導入されたファイルベースのルーティングシステム。`app/` ディレクトリにページやレイアウトを配置する。 |
| Atomic Design | Atomic Design | Brad Frost が提唱したUI設計手法。atoms（最小単位）、molecules（組み合わせ）、organisms（複合体）の階層でコンポーネントを分類する。 |
| Glassmorphism | Glassmorphism | すりガラス効果を用いたUIデザイントレンド。`backdrop-blur` と半透明背景の組み合わせで実現。本プロジェクトでは `glass-effect` / `glass-card` クラスとして実装。 |
| Neon Effect | Neon Effect | CSSグラデーションと `text-shadow` / `box-shadow` を用いた発光テキスト・要素効果。`neon-text` / `shadow-neon` クラスとして実装。 |
| OGP | Open Graph Protocol | Webページのメタデータ規格。SNS等でURLをシェアした際のタイトル・画像・説明を制御する。 |
| Zod | Zod | TypeScript ファーストのスキーマバリデーションライブラリ。お問い合わせフォームのバリデーションに使用。 |
| React Hook Form | React Hook Form | React向けの高パフォーマンスフォームライブラリ。非制御コンポーネントベースで不要な再レンダリングを抑制する。 |
| Resend | Resend | 開発者向けメール送信API。お問い合わせフォームからのメール送信に使用。 |
| Tailwind CSS | Tailwind CSS | ユーティリティファーストのCSSフレームワーク。クラス名でスタイルを直接指定する。 |
| clsx | clsx | 条件付きクラス名結合のための軽量ユーティリティ。`tailwind-merge` と組み合わせて `cn()` ヘルパーとして使用。 |
| CI/CD | Continuous Integration / Continuous Deployment | 継続的インテグレーション・デリバリー。GitHub Actions を使用して Cloud Run へ自動デプロイする。 |
| Cloud Run | Google Cloud Run | Google Cloud のサーバーレスコンテナプラットフォーム。GitHub Actions から Docker イメージをビルド・デプロイする。 |
| Artifact Registry | Google Artifact Registry | Google Cloud のコンテナイメージレジストリ。Docker イメージの保管に使用。 |

---

## 2. 外部参照・ドキュメントリンク

### 2.1 フレームワーク・ライブラリ

| 技術 | バージョン | ドキュメント |
|------|-----------|-------------|
| Next.js | 14.2.5 | https://nextjs.org/docs |
| React | 18.3.1 | https://react.dev |
| TypeScript | 5.5.2 | https://www.typescriptlang.org/docs/ |
| Tailwind CSS | 3.4.4 | https://tailwindcss.com/docs |
| React Hook Form | ^7.51.4 | https://react-hook-form.com |
| Zod | ^3.23.8 | https://zod.dev |
| Resend | ^4.6.0 | https://resend.com/docs |
| @google-cloud/storage | ^7.16.0 | https://cloud.google.com/storage/docs/reference/libraries |
| clsx | ^2.1.1 | https://github.com/lukeed/clsx |
| tailwind-merge | ^2.3.0 | https://github.com/dcastil/tailwind-merge |

### 2.2 開発ツール

| ツール | バージョン | ドキュメント |
|--------|-----------|-------------|
| ESLint | 8.57.0 | https://eslint.org/docs/latest/ |
| Prettier | ^3.3.2 | https://prettier.io/docs/en/ |
| @typescript-eslint | ^7.18.0 | https://typescript-eslint.io/ |
| PostCSS | 8.4.38 | https://postcss.org/ |
| Autoprefixer | 10.4.19 | https://github.com/postcss/autoprefixer |

### 2.3 インフラ・サービス

| サービス | 用途 | ドキュメント |
|----------|------|-------------|
| Cloud Run | 本番デプロイ先 | https://cloud.google.com/run/docs |
| Google Cloud Storage | ポートフォリオデータ格納 | https://cloud.google.com/storage/docs |
| Google Cloud Run | コンテナデプロイ（GitHub Actions経由） | https://cloud.google.com/run/docs |
| Google Artifact Registry | Docker イメージ管理 | https://cloud.google.com/artifact-registry/docs |
| Resend | メール送信 | https://resend.com/docs |
| GitHub Actions | CI/CD | https://docs.github.com/en/actions |

---

## 3. 開発環境セットアップガイド

### 3.1 前提条件

| 項目 | 要件 |
|------|------|
| Node.js | 18.x 以上 |
| pnpm | 10.x（`pnpm@10.33.0` を `packageManager` でピン留め） |
| Git | 最新安定版 |
| エディタ | VS Code 推奨（ESLint / Prettier 拡張機能） |

### 3.2 初期セットアップ

```bash
# 1. リポジトリのクローン
git clone https://github.com/kojikawazu/nextjs-intro-app.git
cd nextjs-intro-app

# 2. 依存パッケージのインストール
pnpm install

# 3. 表示データの用意（同梱サンプルをコピー）
cp sample.example.json sample.json

# 4. 環境変数ファイルの作成（お問い合わせ送信・GCS を使う場合）
cp .env.example .env.local
```

### 3.3 環境変数

`.env.local` に以下の環境変数を設定する。

| 変数名 | 必須 | 説明 | 例 |
|--------|------|------|-----|
| `GOOGLE_APPLICATION_CREDENTIALS` | 開発時任意 | GCSサービスアカウントキーファイルパス | `/path/to/credentials.json` |
| `GOOGLE_CLOUD_PROJECT_ID` | 開発時任意 | Google Cloud プロジェクトID | `my-project-123` |
| `GCS_PRIVATE_BUCKET_NAME` | 任意 | GCSバケット名（デフォルト: `intro_k_pri_bucket`） | `intro_k_pri_bucket` |
| `GCS_JSON_PATH` | 任意 | GCS内JSONファイルパス（デフォルト: `json/navbar_intro.json`） | `json/navbar_intro.json` |
| `FORCE_GCS` | 任意 | 開発時にGCSからのデータ取得を強制 | `true` |
| `RESEND_API_KEY` | 本番必須 | Resend APIキー（`re_` プレフィックス） | `re_xxxxxxxx` |
| `RESEND_FROM_EMAIL` | 本番必須 | 送信元メールアドレス | `noreply@yourdomain.com` |
| `MY_MAIL_ADDRESS` | 本番必須 | お問い合わせ受信メールアドレス | `your@email.com` |

### 3.4 ローカル開発（GCSなし）

`data-server.ts` にはローカルフォールバックのロジックが実装されている。`sample.json` 自体は `.gitignore` 済みでリポジトリに含まれないが、**同梱の `sample.example.json` をコピーすれば GCS 接続なしで即座に動作する**。

```bash
# 同梱サンプルをコピー（PortfolioData 型に準拠したデモデータ）
cp sample.example.json sample.json
# プロジェクトルート直下の sample.json を data-server.ts が自動的に読み込む
# 自分のデータで sample.json を上書きすれば表示内容を差し替えられる

# 開発サーバーの起動
pnpm dev
```

ブラウザで `http://localhost:3000` にアクセスして動作確認を行う。

### 3.5 利用可能なスクリプト

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | 開発サーバー起動（ホットリロード対応） |
| `pnpm build` | 本番ビルド |
| `pnpm start` | 本番ビルドのローカル実行 |
| `pnpm lint` | ESLint によるコード静的解析 |
| `pnpm format` | Prettier によるコード自動整形 |
| `pnpm format:check` | Prettier による整形チェック（CI用） |
| `pnpm type-check` | TypeScript 型チェック（`tsc --noEmit`） |

---

## 4. コーディング規約

### 4.1 TypeScript 規約

| 項目 | ルール |
|------|--------|
| strict モード | 有効（`tsconfig.json` で `"strict": true`） |
| 未使用変数 | エラー（`@typescript-eslint/no-unused-vars: "error"`） |
| any 型の使用 | 警告（`@typescript-eslint/no-explicit-any: "warn"`） |
| const 優先 | 必須（`prefer-const: "error"`） |
| モジュール | ESModules（`"module": "esnext"`） |
| ターゲット | ES5（`"target": "es5"`） |
| パスエイリアス | `@/*` は `./src/*` にマッピング |

### 4.2 コードフォーマット（Prettier）

| 項目 | 設定値 |
|------|--------|
| セミコロン | あり（`semi: true`） |
| クォート | シングルクォート（`singleQuote: true`） |
| 末尾カンマ | すべて（`trailingComma: "all"`） |
| 行幅 | 100文字（`printWidth: 100`） |
| インデント | 4スペース（`tabWidth: 4`） |

### 4.3 コンポーネント命名規則

| 分類 | ディレクトリ | 命名 | 例 |
|------|-------------|------|-----|
| Atom | `src/components/atoms/` | PascalCase | `Button.tsx`, `Input.tsx`, `Badge.tsx`, `TextArea.tsx` |
| Molecule | `src/components/molecules/` | PascalCase | `SkillCard.tsx`, `CareerCard.tsx`, `SocialLinks.tsx` |
| Organism | `src/components/organisms/` | PascalCase | `Header.tsx`, `ContactForm.tsx` |
| Page | `src/app/` | Next.js 規約（`page.tsx`） | `page.tsx` |
| Layout | `src/app/` | Next.js 規約（`layout.tsx`） | `layout.tsx` |
| API Route | `src/app/api/[name]/` | Next.js 規約（`route.ts`） | `route.ts` |

### 4.4 ファイル構成規則

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── contact/       # お問い合わせ API
│   │   │   └── route.ts
│   │   └── portfolio/     # ポートフォリオデータ API
│   │       └── route.ts
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/            # Atomic Design ベースのコンポーネント
│   ├── atoms/             # 最小単位の汎用コンポーネント
│   ├── molecules/         # 複数 atoms の組み合わせ
│   └── organisms/         # 複合的な機能コンポーネント
├── lib/                   # 外部サービス連携・データ取得
│   ├── gcs.ts             # Google Cloud Storage クライアント
│   ├── resend.ts          # Resend メール送信
│   ├── data-server.ts     # サーバーサイドデータ取得（GCS + ローカルフォールバック）
│   └── costom-date.ts     # 日付フォーマットユーティリティ
├── types/                 # TypeScript 型定義
│   └── portfolio.ts       # ポートフォリオデータ型
└── utils/                 # ユーティリティ関数
    ├── cn.ts              # clsx + tailwind-merge ヘルパー
    └── validation.ts      # Zod バリデーションスキーマ
```

### 4.5 コンポーネント実装パターン

| パターン | 適用対象 | 方法 |
|----------|---------|------|
| `React.forwardRef` | フォーム要素（Input, TextArea, Button） | ref 転送で外部からのDOM操作を可能にする |
| Named export | すべてのコンポーネント | `export function Component()` または `export { Component }` |
| 型のエクスポート | Props 型 | コンポーネントと共に `export type { ComponentProps }` |
| `'use client'` ディレクティブ | クライアントサイド操作を含むコンポーネント | ファイル先頭に `'use client'` を記述 |
| `cn()` ユーティリティ | クラス名の結合 | `cn(baseClass, conditionalClass, className)` パターン |

### 4.6 CSS / スタイル規約

| 項目 | ルール |
|------|--------|
| スタイリング手法 | Tailwind CSS ユーティリティクラスを使用 |
| カスタムクラス | `globals.css` に定義（`glass-effect`, `glass-card`, `neon-text` 等） |
| レスポンシブ | Tailwind のブレークポイント（`md:`, `lg:`, `xl:`）を使用 |
| カラーパレット | `tailwind.config.js` のカスタムカラー（`primary`, `secondary`, `accent`, `purple`） |
| フォント | Inter（欧文）、Noto Sans JP（和文）、JetBrains Mono / Fira Code（等幅） |
| アニメーション | Tailwind config で定義されたカスタムアニメーション（`fade-in-up`, `float`, `glow` 等） |

---

## 5. Git ワークフロー・ブランチ戦略

### 5.1 ブランチ構成

本プロジェクトでは、GitHub Flow をベースとしたシンプルなブランチ戦略を採用する。

```
main（本番）
  ├── feature/YYYYMMDD-dev    # 機能開発ブランチ
  └── fix/[issue-description] # バグ修正ブランチ
```

| ブランチ | 用途 | マージ先 |
|---------|------|---------|
| `main` | 本番環境・デプロイ対象 | - |
| `feature/YYYYMMDD-dev` | 新機能開発（日付ベースの命名） | `main` |
| `fix/[description]` | バグ修正 | `main` |

### 5.2 開発フロー

1. `main` ブランチから feature/fix ブランチを作成
2. 機能開発・修正をコミット
3. GitHub 上で Pull Request を作成
4. レビュー後に `main` へマージ（Merge commit）
5. `main` へのマージにより GitHub Actions が自動デプロイを実行

### 5.3 コミットメッセージ

観測されたコミット履歴に基づくコミットメッセージの慣例:

| パターン | 例 |
|----------|-----|
| 機能追加 | `readme.md更新` |
| バグ修正 | `バグ修正(日付表示)` |
| バグ修正（詳細） | `Skillsセクション「and more...」ボタンのアニメーション遅延バグを修正` |
| CI修正 | `GitHub Actionsバグ修正` |
| その他 | `add LICENSE`, `要件定義書修正` |

※ 日本語でのコミットメッセージが主体。変更内容を簡潔に記述するスタイル。

### 5.4 CI/CD パイプライン

`main` ブランチへのプッシュ時に GitHub Actions が以下を自動実行する:

1. コードのチェックアウト
2. Google Cloud 認証
3. Docker イメージのビルド
4. Artifact Registry へのプッシュ
5. Cloud Run へのデプロイ
6. 古いイメージのクリーンアップ（最新5件を保持）

**トリガー対象パス**: `.github/**`, `src/**`, `Dockerfile`, `docker-compose.yml`, `next.config.mjs`, `pnpm-lock.yaml`, `package.json`, `playwright.config.ts`, `postcss.config.js`, `tailwind.config.js`, `tsconfig.json`

---

## 6. 既知の問題と制限事項

### 6.1 既知の問題

| # | 分類 | 内容 | 影響度 | 備考 |
|---|------|------|--------|------|
| 1 | パフォーマンス | `next.config.js` で `images.unoptimized: true` が設定されており、Next.js の画像最適化（WebP変換、リサイズ等）が無効 | 中 | 外部URLからの画像取得のため無効化されている可能性が高い。代替としてCDNレベルの最適化を検討 |
| 2 | パフォーマンス | Google Fonts（Inter, Noto Sans JP, JetBrains Mono）が CSS `@import` で読み込まれている | 低 | `next/font` を使用することでフォントの自動最適化・プリロードが可能 |
| 3 | エラーハンドリング | React Error Boundary が未実装 | 中 | コンポーネントレベルのエラーでページ全体がクラッシュする可能性がある |
| 4 | UX | ローディング表示がスピナーのみ（スケルトンスクリーン未実装） | 低 | 体感パフォーマンスの改善余地あり |
| 5 | セキュリティ | お問い合わせフォームにレート制限（Rate Limiting）が未実装 | 中 | スパム送信のリスクがある |
| 6 | アクセシビリティ | `page.tsx` のローディング/エラー状態にaria属性が不足 | 低 | スクリーンリーダーでの状態通知が不十分 |
| 7 | コード品質 | `costom-date.ts` のファイル名にタイプミス（正: `custom-date.ts`） | 低 | リネーム時にインポートパスの更新が必要 |
| 8 | Webpack設定 | クライアントバンドルからNode.jsモジュールを除外するため、多数の `fallback: false` 設定が必要 | 低 | GCSクライアントのサーバーサイド限定使用に起因 |

### 6.2 機能的な制限事項

| # | 制限事項 | 詳細 |
|---|----------|------|
| 1 | 言語サポート | 日本語のみ対応。i18n（国際化）は未実装 |
| 2 | アナリティクス | Google Analytics 等のトラッキングツール未導入 |
| 3 | データ更新 | ポートフォリオデータの更新はGCSのJSONファイルを直接編集する必要がある。管理画面（CMS）は未実装 |
| 4 | テスト | テストフレームワーク未導入。ユニットテスト・E2Eテストなし |
| 5 | キャッシュ戦略 | API Route で `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400` を設定しているが、ISR は未使用 |
| 6 | メール送信 | 送信確認メール（ユーザーへの自動返信）は未実装。サイトオーナーへの通知のみ |
| 7 | ダークモード | ダークテーマのみ対応。ライトモード/テーマ切替は未実装 |
| 8 | SEO | OGP画像が未設定（`og:image` なし） |

### 6.3 ブラウザサポート

| ブラウザ | サポート状況 |
|----------|-------------|
| Chrome（最新） | 対応 |
| Firefox（最新） | 対応 |
| Safari（最新） | 対応 |
| Edge（最新） | 対応 |
| IE11 | 非対応 |

※ `backdrop-filter` (Glassmorphism) は主要モダンブラウザで対応済み。

---

## 7. セキュリティ考慮事項

| 項目 | 現在の対応 | 備考 |
|------|-----------|------|
| 環境変数 | `.env*.local` を `.gitignore` で除外 | APIキー・認証情報の漏洩防止 |
| GCS認証 | 本番: ADC、開発: サービスアカウントキー | 本番環境では明示的な認証情報不要 |
| XSS対策 | React のデフォルトエスケープ機能に依存 | 生のHTML挿入は未使用 |
| CSRF対策 | API Route はサーバーサイドで処理 | 追加のCSRFトークン検証は未実装 |
| 入力バリデーション | クライアント: Zod + React Hook Form、サーバー: API Route で基本チェック | 二重バリデーション実施 |
| レート制限 | 未実装 | 今後の対応が必要 |
| メール送信 | Resend API 経由（API キーで認証） | 送信元ドメインの検証はResend側で管理 |
| 外部リンク | `rel="noopener noreferrer"` を適用 | タブナビング攻撃の防止 |

---

## 8. パフォーマンス指標

| 項目 | 現状 | 目標 |
|------|------|------|
| 初回ロード | スピナー表示後にデータ取得 | スケルトンスクリーン導入で体感速度改善 |
| APIレスポンスキャッシュ | `s-maxage=300`（5分）、`stale-while-revalidate=86400`（24時間） | 適切なキャッシュ戦略 |
| 画像最適化 | 無効（`unoptimized: true`） | 外部画像対応の最適化検討 |
| バンドルサイズ | Node.js モジュール除外済み | 定期的な依存関係の見直し |
| フォント読み込み | CSS `@import` | `next/font` への移行推奨 |
