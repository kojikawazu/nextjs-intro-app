# テスト仕様書

> ℹ️ **テスト基盤は導入済み（Vitest + Testing Library + MSW + Testcontainers + Playwright）。**ユニットテスト（`pnpm test:run`）/ 統合テスト（`pnpm test:it`）/ E2E（`pnpm test:e2e`）の 3 層が実装され、CI（`.github/workflows/ci.yml` / `e2e.yml`）で実行されます。本書に記載のケースのうち未実装のものは導入時の指針であり、実在するコードではありません。

## 目次

- [プロジェクト情報](#プロジェクト情報)
- [1. テスト戦略概要](#1-テスト戦略概要)
    - [1.1 現状分析](#11-現状分析)
    - [1.2 テストピラミッド](#12-テストピラミッド)
    - [1.3 全体カバレッジ目標](#13-全体カバレッジ目標)
- [2. 推奨テストツール](#2-推奨テストツール)
    - [2.1 ユニットテスト・統合テスト](#21-ユニットテスト統合テスト)
    - [2.2 E2Eテスト](#22-e2eテスト)
    - [2.3 補助ツール](#23-補助ツール)
- [3. テスト環境セットアップ](#3-テスト環境セットアップ)
    - [3.1 パッケージインストール](#31-パッケージインストール)
    - [3.2 Vitest 設定ファイル](#32-vitest-設定ファイル)
    - [3.3 テストセットアップファイル](#33-テストセットアップファイル)
    - [3.4 package.json スクリプト追加](#34-packagejson-スクリプト追加)
    - [3.5 Playwright 設定ファイル](#35-playwright-設定ファイル)
    - [3.6 推奨ディレクトリ構成](#36-推奨ディレクトリ構成)
- [4. ユニットテスト仕様](#4-ユニットテスト仕様)
    - [4.1 ユーティリティ関数](#41-ユーティリティ関数)
        - [4.1.1 cn関数 (`src/utils/cn.ts`)](#411-cn関数-srcutilscnts)
        - [4.1.2 toDateString関数 (`src/lib/custom-date.ts`)](#412-todatestring関数-srclibcustom-datets)
        - [4.1.3 formatCareerPeriod関数 (`src/app/page.tsx` 内)](#413-formatcareerperiod関数-srcapppagetsx-内)
    - [4.2 バリデーションロジック](#42-バリデーションロジック)
        - [4.2.1 ContactFormSchema (`src/schemas/contact.ts`)](#421-contactformschema-srcschemascontactts)
    - [4.3 Atoms / Molecules / Organisms コンポーネント](#43-atoms--molecules--organisms-コンポーネント)
    - [4.6 サイトURL解決とクローラ向けルート](#46-サイトurl解決とクローラ向けルート)
        - [4.6.1 getSiteUrl関数 (`src/lib/site-url.ts`)](#461-getsiteurl関数-srclibsite-urlts)
        - [4.6.2 sitemap (`src/app/sitemap.ts`)](#462-sitemap-srcappsitemapts)
        - [4.6.3 robots (`src/app/robots.ts`)](#463-robots-srcapprobotsts)
    - [4.7 実装済みコンポーネントテスト](#47-実装済みコンポーネントテスト)
        - [4.7.1 CareerCard (`src/components/molecules/CareerCard.tsx`)](#471-careercard-srccomponentsmoleculescareercardtsx)
        - [4.7.2 ThemeToggle (`src/components/atoms/ThemeToggle.tsx`)](#472-themetoggle-srccomponentsatomsthemetoggletsx)
        - [4.7.3 Badge (`src/components/atoms/Badge.tsx`)](#473-badge-srccomponentsatomsbadgetsx)
        - [4.7.4 Button (`src/components/atoms/Button.tsx`)](#474-button-srccomponentsatomsbuttontsx)
        - [4.7.5 Input (`src/components/atoms/Input.tsx`)](#475-input-srccomponentsatomsinputtsx)
        - [4.7.6 TextArea (`src/components/atoms/TextArea.tsx`)](#476-textarea-srccomponentsatomstextareatsx)
        - [4.7.7 SocialLinks (`src/components/molecules/SocialLinks.tsx`)](#477-sociallinks-srccomponentsmoleculessociallinkstsx)
        - [4.7.8 Header (`src/components/organisms/Header.tsx`)](#478-header-srccomponentsorganismsheadertsx)
        - [4.7.9 ContactForm (`src/components/organisms/ContactForm.tsx`)](#479-contactform-srccomponentsorganismscontactformtsx)
        - [4.7.10 useTheme (`src/hooks/useTheme.ts`)](#4710-usetheme-srchooksusethemets)
        - [4.7.11 ProductCard (`src/components/molecules/ProductCard.tsx`)](#4711-productcard-srccomponentsmoleculesproductcardtsx)
        - [4.7.12 ArticleEntry (`src/components/molecules/ArticleEntry.tsx`)](#4712-articleentry-srccomponentsmoleculesarticleentrytsx)
        - [4.7.13 SectionHeading とセクション organisms](#4713-sectionheading-とセクション-organisms)
        - [4.7.14 lib へ切り出したロジック](#4714-lib-へ切り出したロジック)
        - [4.7.15 AiPracticeEntry (`src/components/molecules/AiPracticeEntry.tsx`)](#4715-aipracticeentry-srccomponentsmoleculesaipracticeentrytsx)
- [5. 統合テスト仕様](#5-統合テスト仕様)
    - [5.1 APIルート](#51-apiルート)
        - [5.1.1 GET /api/portfolio (`src/app/api/portfolio/route.ts`)](#511-get-apiportfolio-srcappapiportfolioroutets)
        - [5.1.2 POST /api/contact (`src/app/api/contact/route.ts`)](#512-post-apicontact-srcappapicontactroutets)
    - [5.2 データフェッチフロー](#52-データフェッチフロー)
        - [5.2.1 portfolio (`src/repositories/portfolio.ts`)](#521-portfolio-srcrepositoriesportfoliots)
        - [5.2.2 GCSクライアント (`src/repositories/gcs.ts`)](#522-gcsクライアント-srcrepositoriesgcsts)
        - [5.2.3 Resendクライアント (`src/repositories/resend.ts`)](#523-resendクライアント-srcrepositoriesresendts)
- [6. E2Eテスト仕様](#6-e2eテスト仕様)
    - [6.1 ホームページ表示テスト](#61-ホームページ表示テスト)
    - [6.2 ナビゲーションテスト](#62-ナビゲーションテスト)
    - [6.3 お問い合わせフォームテスト](#63-お問い合わせフォームテスト)
    - [6.4 レスポンシブデザインテスト](#64-レスポンシブデザインテスト)
    - [6.5 アクセシビリティテスト](#65-アクセシビリティテスト)
    - [6.6 SEOメタデータテスト](#66-seoメタデータテスト)
    - [6.7 サーバーサイドレンダリングテスト](#67-サーバーサイドレンダリングテスト)
    - [6.8 データ取得失敗テスト](#68-データ取得失敗テスト)
    - [6.9 セキュリティヘッダー・CSP テスト](#69-セキュリティヘッダーcsp-テスト)
    - [6.10 フォームアクセシビリティテスト](#610-フォームアクセシビリティテスト)
    - [6.11 配色テーマ解決テスト](#611-配色テーマ解決テスト)
    - [6.12 経歴の技術スタック表示](#612-経歴の技術スタック表示)
    - [6.13 個人開発のリンク出し分け](#613-個人開発のリンク出し分け)
    - [6.14 執筆記事の表示](#614-執筆記事の表示)
    - [6.15 AI 活用の表示](#615-ai-活用の表示)
- [7. パフォーマンステスト](#7-パフォーマンステスト)
    - [7.1 Lighthouse指標目標](#71-lighthouse指標目標)
    - [7.2 APIパフォーマンス](#72-apiパフォーマンス)
- [8. モックデータ仕様](#8-モックデータ仕様)
    - [8.1 MSWハンドラー定義](#81-mswハンドラー定義)
    - [8.2 モックポートフォリオデータ構造](#82-モックポートフォリオデータ構造)
- [9. CI/CD テスト統合](#9-cicd-テスト統合)
    - [9.1 GitHub Actions ワークフロー](#91-github-actions-ワークフロー)
    - [9.2 実行条件](#92-実行条件)
    - [9.3 テスト失敗時のポリシー](#93-テスト失敗時のポリシー)
- [10. テスト実装優先順位](#10-テスト実装優先順位)
    - [フェーズ1: 基盤構築（優先度: 高）](#フェーズ1-基盤構築優先度-高)
    - [フェーズ2: コア機能テスト（優先度: 高）](#フェーズ2-コア機能テスト優先度-高)
    - [フェーズ3: 画面テスト（優先度: 中）](#フェーズ3-画面テスト優先度-中)
    - [フェーズ4: E2E・品質テスト（優先度: 中）](#フェーズ4-e2e品質テスト優先度-中)
    - [フェーズ5: CI/CD統合（優先度: 低）](#フェーズ5-cicd統合優先度-低)

---

## プロジェクト情報

| 項目 | 内容 |
|------|------|
| プロジェクト名 | TechProfile Pro |
| ドキュメント種別 | テスト仕様書 |
| バージョン | 1.0.0 |
| 作成日 | 2026-03-20 |
| 対象技術スタック | Next.js 15.5.25 / TypeScript 5.5.2 / React 19.3.0 |

---

## 1. テスト戦略概要

### 1.1 現状分析

テスト基盤（**Vitest 4 + Testing Library + jsdom**）を導入済み。`package.json` に `test` / `test:run` / `test:coverage` / `test:it` スクリプトを定義し、CI で `pnpm test:run`（UT）と `pnpm test:it`（IT）を実行している。

- **ユニットテスト**: ユーティリティ・スキーマ・コンポーネント（Atoms / Molecules / Organisms）・フックを実装済み（`vitest.config.ts`）。2026-09-25 時点で 39 ファイル・354 ケース。内訳は §4。
- **統合テスト**: `*.integration.test.ts`（`vitest.integration.config.ts` + `pnpm test:it`）を実装済み。2026-09-25 時点で 3 ファイル・18 ケース。**GCS は `fsouza/fake-gcs-server` コンテナ（Testcontainers）で実データ経路を検証**し、**Resend は MSW で HTTP をモック**（testing.md: 外部 I/O のみモック）。対象は `GET /api/portfolio`・`POST /api/contact`・`gcs.getPortfolioDataFromGCS`。要 Docker。
  - GCS エミュレータ接続は `gcs.ts` の `GCS_API_ENDPOINT`（本番未設定）で `apiEndpoint` を上書きして実現。
  - この IT により、`resend.ts` が Resend の HTTP エラーを成功扱いする不具合を検出・修正した（`result.error` を検査するよう修正、`docs/11` #50）。

- **E2E テスト**: Playwright で `e2e/` にシナリオテストを実装済み（`pnpm test:e2e`）。2026-09-25 時点で 7 ファイル・56 ケース（うち 2 ケースはデータ取得失敗を再現する別プロジェクト `chromium-error`）。一覧は §6。**ポートフォリオ表示は fake-gcs-server コンテナの実データ**（本番ビルドのサーバを `GCS_API_ENDPOINT` でコンテナへ向ける）、**お問い合わせ送信・失敗系はブラウザで `page.route` により API をスタブ**（Resend はエミュレータ無し）。正常/準正常/異常を網羅。flaky 対策として CI では `retries: 2` + 失敗時 trace/screenshot/video。専用ワークフロー `.github/workflows/e2e.yml`（PR）で実行。要 Docker + `pnpm build`。
  - E2E 導入時に、`/api/portfolio` がビルド時プリレンダーされ実行時に GCS を参照しない不具合を検出・修正した（`export const dynamic = 'force-dynamic'`、`docs/11` #51）。

コンポーネントテストは issue #138 / #141 で実装した。前提だった JSX 変換は、Vite 8 が esbuild ではなく oxc を使うため `vitest.config.ts` の `oxc` 設定で解消している（`@vitejs/plugin-react` は使っていない）。

> 件数は本節を書いた時点のスナップショットであり、テストの追加で古くなる。**正は各コマンドの出力**とする。
> 以前は「計 7 ケース」「計 33 ケース」のまま長く放置され、実態と乖離していた（issue #148）。

本仕様書の各節は**実装済みのテストを正本として記述する**。§4.3（UT）・§6.1〜§6.5（E2E）にあった実装前の計画表は、実装と二重管理になって乖離したため削除した。

### 1.2 テストピラミッド

本プロジェクトでは以下の3階層でテストを構成する。

```text
        /  E2E テスト  \          <- 少数・高コスト
       / 統合テスト      \        <- 中程度
      / ユニットテスト     \      <- 多数・低コスト
     /_____________________\
```

| テスト階層 | 対象 | 目標カバレッジ |
|------------|------|----------------|
| ユニットテスト | コンポーネント、ユーティリティ関数、バリデーション、型定義 | 80%以上 |
| 統合テスト | APIルート、データフェッチフロー、フォーム送信フロー | 70%以上 |
| E2Eテスト | ユーザー操作フロー全体（ページ表示、ナビゲーション、フォーム送信） | 主要シナリオ網羅 |

### 1.3 全体カバレッジ目標

| メトリクス | 目標値 |
|-----------|--------|
| ステートメントカバレッジ | 80%以上 |
| ブランチカバレッジ | 75%以上 |
| 関数カバレッジ | 85%以上 |
| 行カバレッジ | 80%以上 |

---

## 2. 推奨テストツール

### 2.1 ユニットテスト・統合テスト

| ツール | バージョン | 用途 |
|--------|-----------|------|
| Vitest | ^2.0.0 | テストランナー（Next.js / TypeScript との親和性が高く、Vite ベースで高速） |
| @testing-library/react | ^16.0.0 | Reactコンポーネントのレンダリング・操作テスト |
| @testing-library/jest-dom | ^6.0.0 | DOMアサーションマッチャー拡張 |
| @testing-library/user-event | ^14.0.0 | ユーザーインタラクションのシミュレーション |
| jsdom | ^24.0.0 | ブラウザ環境のエミュレーション |
| msw (Mock Service Worker) | ^2.0.0 | APIリクエストのモック |

### 2.2 E2Eテスト

| ツール | バージョン | 用途 |
|--------|-----------|------|
| Playwright | ^1.45.0 | ブラウザ自動テスト（Chromium、Firefox、WebKit 対応） |

### 2.3 補助ツール

| ツール | 用途 |
|--------|------|
| @vitest/coverage-v8 | カバレッジレポート生成 |
| @vitest/ui | テスト結果のビジュアルUI |
| bash（`scripts/*.test.sh`） | シェルスクリプトの自己テスト。現状は `scripts/secret-scan.test.sh` のみ |

Vitest は `src/**` と jsdom を前提とするため、`scripts/` のシェルスクリプトは bash のテストで検証する。`scripts/secret-scan.test.sh` は一時 Git リポジトリで秘匿ファイルを `git add -f` で追跡させ、検出対象（準正常系）・誤検知しないファイル（正常系）・`.gitignore` の除外を検証する。CI（`secret-scan.yml`）が本番のスキャンの前に実行する（docs/06 §11.2）。

---

## 3. テスト環境セットアップ

### 3.1 パッケージインストール

```bash
# ユニットテスト・統合テスト
pnpm add -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom msw @vitest/coverage-v8 @vitest/ui

# E2Eテスト
pnpm add -D @playwright/test
pnpm exec playwright install
```

### 3.2 Vitest 設定ファイル

ファイル: `vitest.config.ts`（プロジェクトルート）

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/__tests__/**',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3.3 テストセットアップファイル

ファイル: `src/__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### 3.4 package.json スクリプト追加

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 3.5 Playwright 設定ファイル

ファイル: `playwright.config.ts`（プロジェクトルート）

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3.6 推奨ディレクトリ構成

```text
src/
├── __tests__/
│   ├── setup.ts                    # テストセットアップ
│   └── mocks/
│       ├── handlers.ts             # MSW リクエストハンドラー
│       ├── server.ts               # MSW サーバー設定
│       └── portfolio-data.ts       # モックポートフォリオデータ
├── components/
│   ├── atoms/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx         # ← テストファイル（コロケーション）
│   │   ├── Input.tsx
│   │   ├── Input.test.tsx
│   │   ├── TextArea.tsx
│   │   ├── TextArea.test.tsx
│   │   ├── Badge.tsx
│   │   └── Badge.test.tsx
│   ├── molecules/
│   │   ├── CareerCard.tsx
│   │   ├── CareerCard.test.tsx
│   │   ├── SocialLinks.tsx
│   │   └── SocialLinks.test.tsx
│   └── organisms/
│       ├── Header.tsx
│       ├── Header.test.tsx
│       ├── ContactForm.tsx
│       └── ContactForm.test.tsx
├── repositories/
│   ├── portfolio.ts
│   ├── gcs.ts
│   ├── gcs.integration.test.ts
│   └── resend.ts
├── schemas/
│   ├── contact.ts
│   └── contact.test.ts
├── lib/
│   ├── client-ip.ts
│   ├── client-ip.test.ts
│   ├── custom-date.ts
│   ├── custom-date.test.ts
│   ├── html-escape.ts
│   ├── html-escape.test.ts
│   ├── mail-header.ts
│   ├── mail-header.test.ts
│   ├── logger.ts
│   ├── logger.test.ts
│   ├── rate-limit.ts
│   ├── rate-limit.test.ts
│   ├── site-url.ts
│   └── site-url.test.ts
├── utils/
│   ├── cn.ts
│   └── cn.test.ts
└── app/
    ├── page.tsx
    ├── page.test.tsx
    └── api/
        ├── portfolio/
        │   ├── route.ts
        │   └── route.test.ts
        └── contact/
            ├── route.ts
            └── route.test.ts
e2e/
├── home.spec.ts                    # ホームページE2Eテスト
├── navigation.spec.ts             # ナビゲーションE2Eテスト
└── contact-form.spec.ts           # お問い合わせフォームE2Eテスト
```

---

## 4. ユニットテスト仕様

### 4.1 ユーティリティ関数

#### 4.1.1 cn関数 (`src/utils/cn.ts`)

| テストID | テストケース | 入力 | 期待出力 |
|----------|------------|------|---------|
| UT-CN-001 | 単一クラス名を返す | `cn('text-white')` | `'text-white'` |
| UT-CN-002 | 複数クラス名を結合する | `cn('text-white', 'bg-black')` | `'text-white bg-black'` |
| UT-CN-003 | 条件付きクラス名を処理する | `cn('base', false && 'hidden', true && 'visible')` | `'base visible'` |
| UT-CN-004 | Tailwind クラスの競合を解決する | `cn('px-4', 'px-6')` | `'px-6'` |
| UT-CN-005 | undefined/null を無視する | `cn('base', undefined, null, 'end')` | `'base end'` |
| UT-CN-006 | 空配列を処理する | `cn()` | `''` |
| UT-CN-007 | オブジェクト記法を処理する | `cn({ 'text-white': true, 'text-black': false })` | `'text-white'` |

#### 4.1.2 toDateString関数 (`src/lib/custom-date.ts`)

| テストID | テストケース | 入力 | 期待出力 |
|----------|------------|------|---------|
| UT-DATE-001 | 正常な年月文字列を変換する | `'2024年1月'` | `'2024/01/01'` |
| UT-DATE-002 | 2桁月を正しく処理する | `'2023年12月'` | `'2023/12/01'` |
| UT-DATE-003 | 1桁月をゼロパディングする | `'2020年3月'` | `'2020/03/01'` |
| UT-DATE-004 | 不正なフォーマットでエラーを投げる | `'2024-01'` | `Error: Invalid format` |
| UT-DATE-005 | 空文字列でエラーを投げる | `''` | `Error: Invalid format` |
| UT-DATE-006 | 年のみでエラーを投げる | `'2024年'` | `Error: Invalid format` |

#### 4.1.3 formatCareerPeriod関数 (`src/app/page.tsx` 内)

| テストID | テストケース | 入力 | 期待出力 |
|----------|------------|------|---------|
| UT-FCP-001 | 通常の期間を整形する | `('2020年4月', '2023年3月')` | `'2020年4月 - 2023年3月'` |
| UT-FCP-002 | 現在進行中を表示する | `('2023年4月', 'now')` | `'2023年4月 - 現在'` |
| UT-FCP-003 | 同一年の期間を整形する | `('2024年1月', '2024年6月')` | `'2024年1月 - 2024年6月'` |

> 注: `formatCareerPeriod` は `page.tsx` のモジュールスコープに定義されたプライベート関数であるため、テスト容易性のために `src/lib/custom-date.ts` または `src/utils/` 配下に抽出することを推奨する。

#### 4.1.4 escapeHtml関数 (`src/lib/html-escape.ts`)

HTMLメール本文への出力エスケープ（docs/06 §8.1）。正常系2 : 準正常系+異常系14。

| テストID | テストケース | 入力 | 期待出力 |
|----------|------------|------|---------|
| UT-ESC-001 | 特殊文字を含まない文字列はそのまま返す | `'山田太郎'` | `'山田太郎'` |
| UT-ESC-002 | 通常の問い合わせ文はそのまま返す | `'お世話になっております。…'` | 入力と同一 |
| UT-ESC-003 | 山括弧を実体参照へ変換する | `'<b>'` | `'&lt;b&gt;'` |
| UT-ESC-004 | アンパサンドを実体参照へ変換する | `'A&B社'` | `'A&amp;B社'` |
| UT-ESC-005 | ダブルクォートを実体参照へ変換する | `'株式会社"例"'` | `'株式会社&quot;例&quot;'` |
| UT-ESC-006 | シングルクォートは数値参照へ変換する | `"it's"` | `'it&#39;s'` |
| UT-ESC-007 | 5種類すべてが混在しても一度に変換する | `` `&<>"'` `` | `'&amp;&lt;&gt;&quot;&#39;'` |
| UT-ESC-008 | 連続する特殊文字をすべて変換する | `'<<>>'` | `'&lt;&lt;&gt;&gt;'` |
| UT-ESC-009 | エスケープ済み文字列は二重変換される（べき等でない） | `'&amp;'` | `'&amp;amp;'` |
| UT-ESC-010 | scriptタグが実行され得ない文字列になる | `'<script>alert(1)</script>'` | `'&lt;script&gt;alert(1)&lt;/script&gt;'` |
| UT-ESC-011 | 属性を伴うタグ注入を変換する | `'<img src="x" onerror="alert(1)">'` | 山括弧・クォートが実体参照 |
| UT-ESC-012 | 属性値を抜け出すクォート単体も変換する | `'" onmouseover="alert(1)'` | `'&quot; onmouseover=&quot;alert(1)'` |
| UT-ESC-013 | 空文字は空文字を返す | `''` | `''` |
| UT-ESC-014 | 改行・タブは変換しない | `'1行目\n\t2行目'` | 入力と同一 |
| UT-ESC-015 | サロゲートペア（絵文字）を壊さない | `'確認しました👍'` | 入力と同一 |
| UT-ESC-016 | 上限2000文字の入力もすべて変換する | `'<'.repeat(2000)` | `'&lt;'.repeat(2000)` |

#### 4.1.5 logger (`src/lib/logger.ts`)

ログ出力方針の集約（docs/07 §7.2）。`console` の該当メソッドをスパイして「出力されたか / 何を含むか」を検証する。正常系4 : 準正常系+異常系10。

| テストID | テストケース | 前提 | 期待結果 |
|----------|------------|------|---------|
| UT-LOG-001 | `logError` がメッセージとスタックトレースを出力する | `Error` を渡す | `[error] <msg>` と `{ stack }` |
| UT-LOG-002 | `logError` が meta とスタックを併記する | meta あり | `{ bucketName, jsonPath, stack }` |
| UT-LOG-003 | `logError` は本番環境でも出力する | `NODE_ENV=production` | `console.error` が 1 回呼ばれる |
| UT-LOG-004 | `logError` は error 省略時にメッセージのみ出力する | error なし | 第 2 引数なし |
| UT-LOG-005 | `logError` は error 省略・meta のみでも meta を出力する | meta のみ | `{ reason }` |
| UT-LOG-006 | `Error` 以外が throw された場合は `thrown` として残す | 文字列を渡す | `{ thrown: 'just a string' }` |
| UT-LOG-007 | `null` が throw された場合も `thrown` として残す | `null` を渡す | `{ thrown: null }` |
| UT-LOG-008 | stack を持たない `Error` は name と message へ退避する | `stack = undefined` | `{ stack: 'Error: boom' }` |
| UT-LOG-009 | `logWarn` がメッセージを出力する | — | `[warn] <msg>` |
| UT-LOG-010 | `logWarn` は本番環境でも出力する | `NODE_ENV=production` | `console.warn` が 1 回呼ばれる |
| UT-LOG-011 | `logDebug` は開発環境で出力する | `NODE_ENV=development` | `[debug] <msg>` |
| UT-LOG-012 | `logDebug` は本番環境で出力しない | `NODE_ENV=production` | `console.log` が呼ばれない |
| UT-LOG-013 | `logDebug` は test 環境で出力しない | `NODE_ENV=test` | `console.log` が呼ばれない |
| UT-LOG-014 | `logDebug` は `NODE_ENV` 未設定でも出力しない | `NODE_ENV=''` | `console.log` が呼ばれない |

#### 4.1.6 client-ip (`src/lib/client-ip.ts`)

レートリミットのキーに使うクライアント IP の解決（docs/06 §10.2）。正常系2 : 準正常系+異常系8。

| テストID | テストケース | 入力 | 期待出力 |
|----------|------------|------|---------|
| UT-IP-001 | `CF-Connecting-IP` があればそれを返す | `cf-connecting-ip: 203.0.113.5` | `'203.0.113.5'` |
| UT-IP-002 | `X-Forwarded-For` が 1 件ならその値を返す | `x-forwarded-for: 203.0.113.5` | `'203.0.113.5'` |
| UT-IP-003 | `CF-Connecting-IP` を優先する | 両方あり | `CF-Connecting-IP` の値 |
| UT-IP-004 | 複数の `X-Forwarded-For` は右端を返す | `a, b, c` | `c` |
| UT-IP-005 | 詐称された左端の値を採用しない | `1.2.3.4, 203.0.113.5` | `'203.0.113.5'` |
| UT-IP-006 | 前後の空白を取り除く | ` a , b ` | `b` |
| UT-IP-007 | `CF-Connecting-IP` が空白のみなら XFF へ退避 | 空白 + XFF | XFF の値 |
| UT-IP-008 | どちらのヘッダーも無ければ null | `{}` | `null` |
| UT-IP-009 | `X-Forwarded-For` が空文字なら null | `''` | `null` |
| UT-IP-010 | `X-Forwarded-For` がカンマのみなら null | `' , , '` | `null` |

#### 4.1.7 rate-limit (`src/lib/rate-limit.ts`)

スライディングウィンドウのレートリミット（docs/06 §10）。時刻は `now` を明示的に渡して制御する。正常系3 : 準正常系+異常系9。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-RL-001 | 上限（5回）までは許可する | すべて `allowed: true` |
| UT-RL-002 | 許可時は `retryAfterSeconds` が 0 | `{ allowed: true, retryAfterSeconds: 0 }` |
| UT-RL-003 | 上限を 1 件超えたら拒否する | `allowed: false` |
| UT-RL-004 | 拒否時は再試行までの秒数を返す | 最古の記録がウィンドウから外れるまでの秒数 |
| UT-RL-005 | ウィンドウを過ぎれば再び許可する | `allowed: true` |
| UT-RL-006 | 古い記録だけが期限切れになる | 1 枠だけ空く（スライディング） |
| UT-RL-007 | キーが異なれば互いに影響しない | 別キーは `allowed: true` |
| UT-RL-008 | 拒否したリクエストは記録しない | 連打しても解除時刻が動かない |
| UT-RL-009 | `retryAfterSeconds` は最低 1 秒 | `1` |
| UT-RL-010 | ウィンドウ境界ちょうどの記録は期限切れ | `WINDOW_MS - 1` は拒否、`WINDOW_MS` は許可 |
| UT-RL-011 | 空文字のキーでも独立して数える | 他キーに影響しない |
| UT-RL-012 | `resetRateLimitStore` が履歴を消す | 再び `allowed: true` |

#### 4.1.8 mail-header (`src/lib/mail-header.ts`)

メールヘッダーインジェクション対策（docs/06 §8.3）。正常系2 : 準正常系+異常系13。

| テストID | テストケース | 入力 | 期待出力 |
|----------|------------|------|---------|
| UT-MH-001 | 通常の氏名はそのまま返す | `'山田太郎'` | `'山田太郎'` |
| UT-MH-002 | 全角スペースを壊さない | `'山田　太郎'` | 入力と同一（U+3000 は制御文字ではない） |
| UT-MH-003 | LF を除去する | `'山田\n太郎'` | `'山田太郎'` |
| UT-MH-004 | CR を除去する | `'山田\r太郎'` | `'山田太郎'` |
| UT-MH-005 | CRLF を除去する | `'山田\r\n太郎'` | `'山田太郎'` |
| UT-MH-006 | タブを除去する | `'山田\t太郎'` | `'山田太郎'` |
| UT-MH-007 | NUL を除去する | `'山田\u0000太郎'` | `'山田太郎'` |
| UT-MH-008 | DEL を除去する | `'山田\u007F太郎'` | `'山田太郎'` |
| UT-MH-009 | 前後の空白を落とす | `'  山田太郎  '` | `'山田太郎'` |
| UT-MH-010 | 除去の結果生じた前後の空白も落とす | `'\r\n 山田太郎 \r\n'` | `'山田太郎'` |
| UT-MH-011 | Bcc ヘッダーの注入を無力化する | `'山田\r\nBcc: attacker@example.com'` | 改行が消え件名の一部になる |
| UT-MH-012 | 複数ヘッダーの注入を無力化する | CRLF 2 箇所 | 改行がすべて消える |
| UT-MH-013 | 本文の注入（ヘッダー終端の空行）を無力化する | `'山田\r\n\r\n偽の本文'` | 空行が作れない |
| UT-MH-014 | 制御文字のみの入力は空文字 | `'\r\n\t\u0000'` | `''` |
| UT-MH-015 | 空文字は空文字を返す | `''` | `''` |

#### 4.1.9 theme (`src/lib/theme.ts`)

配色テーマの Cookie 解釈（docs/09 §6.7）。正常系4 : 準正常系+異常系10。

Cookie は利用者が自由に書き換えられる外部入力のため、想定外の値で例外を投げず `null`（未選択＝OS 設定に従う）へ倒すことを固定する。

| テストID | テストケース | 入力 | 期待出力 |
|----------|------------|------|---------|
| UT-TH-001 | `'light'` を返す | `'light'` | `'light'` |
| UT-TH-002 | `'dark'` を返す | `'dark'` | `'dark'` |
| UT-TH-003 | Cookie 未設定は null | `undefined` | `null` |
| UT-TH-004 | 空文字は null | `''` | `null` |
| UT-TH-005 | 未知の値は null | `'sepia'` | `null` |
| UT-TH-006 | 大文字は受け付けない | `'Dark'` / `'DARK'` | `null` |
| UT-TH-007 | 前後の空白付きは受け付けない | `' dark'` / `'dark '` | `null` |
| UT-TH-008 | プロトタイプ汚染狙いの値は null | `'__proto__'` ほか | `null` |
| UT-TH-009 | 属性注入狙いの値は null | `'dark; Path=/; Domain=…'` | `null` |
| UT-TH-010 | 極端に長い値は null | `'d'.repeat(10000)` | `null` |
| UT-TH-011 | Cookie 名と値を先頭に置く | `'dark'` | `'theme=dark; …'` で始まる |
| UT-TH-012 | Path と Max-Age を付ける | `'dark'` | `Path=/` / `Max-Age=31536000` |
| UT-TH-013 | SameSite=Lax を付ける | `'dark'` | `SameSite=Lax` |
| UT-TH-014 | HttpOnly を付けない | `'dark'` | 属性なし（クライアントが書くため） |
| UT-TH-015 | Secure を付けない | `'dark'` | 属性なし（`http://localhost` で黙って失敗するのを避ける） |
| UT-TH-016 | 書き出した値を読み戻せる | 両テーマ | `parseTheme` が同じ値を返す |
| UT-TH-017 | 値に Cookie 区切り文字を含めない | 両テーマ | `/^[a-z]+$/` に一致 |

#### 4.1.10 配色トークン (`src/app/globals.css`)

**CSS を読んで検証する例外的なテスト**（`src/app/design-tokens.test.ts`）。

トークンの写像は「既定」「OS ダーク」「明示ライト」「明示ダーク」の 4 ブロックに分かれており、トークンを 1 つ増やしたときに 1 ブロックだけ書き忘れても**ビルドも lint も通り、特定のテーマでだけ色が壊れる**。人間のレビューで 4 ブロックを突き合わせるのは現実的でないため機械で守る。コントラスト比も、色を少し調整しただけで基準を割り込むが人の目では判別できない。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-DT-001 | ライトとダークが同じトークン集合を定義 | 11 トークンが両方に存在 |
| UT-DT-002 | `:root` の既定がライト値を指す | 全トークンが `var(--light-*)` |
| UT-DT-003 | OS ダークがダーク値を指す | 全トークンが `var(--dark-*)` |
| UT-DT-004 | 明示ライトがライト値を指す | 全トークンが `var(--light-*)` |
| UT-DT-005 | 明示ダークがダーク値を指す | 全トークンが `var(--dark-*)` |
| UT-DT-006 | 明示指定が OS 設定より後に書かれている | 詳細度が同じため後勝ちが唯一の上書き手段 |
| UT-DT-007 | 文字色 9 組が 4.5:1 以上（各テーマ） | WCAG 2.1 AA |
| UT-DT-008 | `--field` が `--paper` / `--panel` に対し 3:1 以上 | WCAG 1.4.11 |
| UT-DT-009 | `--rule` が文字色として使える水準に達しない | 装飾用トークンの誤用検出 |

**導入時に、意図的に壊して落ちることを確認済み。** 写像を 1 行削除 / 色をわずかに変更 / ブロックの順序入れ替えの 3 変異をいずれも検出した。

#### 4.1.11 groupTechStack (`src/lib/group-tech-stack.ts`)

技術スタックの分類（docs/05 §5.4）。正常系2 : 準正常系+異常系12。

1 案件あたり最大 30 件のフラットな配列を 9 区分へまとめる。**外部データ（GCS の JSON）を直接受け取る**ため、型が保証されない入力でも落ちないことを固定する。

| テストID | テストケース | 入力 | 期待出力 |
|----------|------------|------|---------|
| UT-GT-001 | 最新案件の 29 件を 8 分類へ分ける | 実データの 29 件 | 分類ごとの技術名が一致（`WSL` は `platform`） |
| UT-GT-002 | 分類の並びが定義順になる | 同上 | `TECH_CATEGORIES` の部分列 |
| UT-GT-003 | 対応表に無い技術は other へ落とす | `['TypeScript','COBOL']` | `COBOL` が `other` |
| UT-GT-004 | 中身のない分類は結果に含めない | `['TypeScript']` | `language` のみ |
| UT-GT-005 | 分類内の並びは入力順を保つ | `['Python3','bash','TypeScript']` | 入力と同順 |
| UT-GT-006 | 大文字小文字が違っても同じ分類 | `['typescript']` / `['NUXT.JS']` | `language` / `framework` |
| UT-GT-007 | 前後の空白を落として扱う | `['  TypeScript  ']` | `['TypeScript']` |
| UT-GT-008 | 分類ごとの表示ラベルを返す | `['TypeScript','Docker']` | `['言語','基盤・CI']` |
| UT-GT-009 | 空配列は空配列 | `[]` | `[]` |
| UT-GT-010 | 重複を 1 件にまとめる | `['Docker','Docker']` | `['Docker']` |
| UT-GT-011 | 大文字小文字違いの重複もまとめる | `['Docker','docker','DOCKER']` | `['Docker']` |
| UT-GT-012 | 空文字・空白のみは捨てる | `['', '   ', '\t']` | `[]` |
| UT-GT-013 | 文字列以外が混ざっても落ちない | `['TypeScript', null, 42, {}]` | `TypeScript` のみ |
| UT-GT-014 | すべて未登録なら other のみ | `['COBOL','Fortran']` | `['other']` |

#### 4.1.12 技術分類の対応表 (`src/constants/tech-categories.ts`)

対応表そのものの整合性。**実データ 82 技術のスナップショットと突き合わせる。**

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-TC-001 | 実在する 82 技術がすべて分類に載る | `other` が 0 件（失敗時はどの技術が漏れたか出る） |
| UT-TC-002 | 対応表のキー数が実データのユニーク数と一致 | 82 件 |
| UT-TC-003 | 対応表に実データへ存在しないキーが無い | 空配列（削除された技術の残骸を検出） |
| UT-TC-004 | 対応表に `other` を直接割り当てていない | 空配列（`other` は受け皿専用） |
| UT-TC-005 | すべての分類が 1 件以上の技術を持つ | 空配列（使われない分類を作らない） |

**このスナップショットには限界がある。** データ側に技術が追加されても配列は変わらないため検出できない。取りこぼしは実行時に「その他」として画面に出ることで気づく設計（docs/05 §5.4）。

**導入時に、対応表から `Vitest` を 1 件削除して 4 つのテストが落ちることを確認済み。**

#### 4.1.13 summarizeCareers (`src/lib/career-summary.ts`)

Hero の数値帯（プロジェクト数 / 使用技術数 / 経歴開始年）の算出。正常系1 : 準正常系+異常系10。

**数値はハードコードせず必ずデータから数える。** 案件や技術が増えたときに数値だけ古いまま残ると、採用担当者に見せる情報として最も質が悪い種類の誤りになる。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-CS-001 | 件数・ユニーク技術数・最古の開始年を返す | 2件 / 3技術 / 2015 |
| UT-CS-002 | 空配列なら 0 / 0 / null | — |
| UT-CS-003 | 同じ技術が複数案件に出ても 1 件 | — |
| UT-CS-004 | 大文字小文字違いは同じ技術 | `Docker` / `docker` / `DOCKER` → 1 |
| UT-CS-005 | 前後の空白を無視する | — |
| UT-CS-006 | 技術が 0 件の案件も件数には数える | — |
| UT-CS-007 | 月が 1 桁でも 2 桁でも同じ年 | `2019年1月` / `2019年01月` |
| UT-CS-008 | 開始年月が不正な案件は開始年から除外（件数と技術数には影響しない） | 1 件の表記ゆれでページ全体を落とさない |
| UT-CS-009 | すべて不正なら開始年は null | — |
| UT-CS-010 | 文字列以外が混ざっても落ちない | — |
| UT-CS-011 | 空文字・空白のみの技術は数えない | — |

### 4.2 バリデーションロジック

#### 4.2.1 ContactFormSchema (`src/schemas/contact.ts`)

**nameフィールド**

| テストID | テストケース | 入力値 | 期待結果 |
|----------|------------|--------|---------|
| UT-VAL-001 | 正常な名前を受け入れる | `'山田太郎'` | バリデーション成功 |
| UT-VAL-002 | 空文字列を拒否する | `''` | エラー: `'お名前は必須です'` |
| UT-VAL-003 | 1文字を拒否する | `'あ'` | エラー: `'お名前は2文字以上で入力してください'` |
| UT-VAL-004 | 2文字を受け入れる（境界値） | `'太郎'` | バリデーション成功 |
| UT-VAL-005 | 50文字を受け入れる（境界値） | 50文字の文字列 | バリデーション成功 |
| UT-VAL-006 | 51文字を拒否する | 51文字の文字列 | エラー: `'お名前は50文字以内で入力してください'` |

**emailフィールド**

| テストID | テストケース | 入力値 | 期待結果 |
|----------|------------|--------|---------|
| UT-VAL-007 | 正常なメールアドレスを受け入れる | `'test@example.com'` | バリデーション成功 |
| UT-VAL-008 | 空文字列を拒否する | `''` | エラー: `'メールアドレスは必須です'` |
| UT-VAL-009 | @なしのメールを拒否する | `'testexample.com'` | エラー: `'正しいメールアドレスを入力してください'` |
| UT-VAL-010 | ドメインなしのメールを拒否する | `'test@'` | エラー: `'正しいメールアドレスを入力してください'` |
| UT-VAL-011 | 255文字を受け入れる（境界値） | 255文字のメールアドレス | バリデーション成功 |
| UT-VAL-012 | 256文字を拒否する | 256文字のメールアドレス | エラー: `'メールアドレスは255文字以内で入力してください'` |
| UT-VAL-013 | 日本語ドメインを検証する | `'test@テスト.jp'` | Zodのemail検証に依存 |

**messageフィールド**

| テストID | テストケース | 入力値 | 期待結果 |
|----------|------------|--------|---------|
| UT-VAL-014 | 正常なメッセージを受け入れる | `'お問い合わせ内容です。詳しく知りたいです。'` | バリデーション成功 |
| UT-VAL-015 | 空文字列を拒否する | `''` | エラー: `'お問い合わせ内容は必須です'` |
| UT-VAL-016 | 9文字を拒否する | 9文字の文字列 | エラー: `'お問い合わせ内容は10文字以上で入力してください'` |
| UT-VAL-017 | 10文字を受け入れる（境界値） | 10文字の文字列 | バリデーション成功 |
| UT-VAL-018 | 2000文字を受け入れる（境界値） | 2000文字の文字列 | バリデーション成功 |
| UT-VAL-019 | 2001文字を拒否する | 2001文字の文字列 | エラー: `'お問い合わせ内容は2000文字以内で入力してください'` |

**スキーマ全体**

| テストID | テストケース | 入力値 | 期待結果 |
|----------|------------|--------|---------|
| UT-VAL-020 | 全フィールド正常値で成功する | `{ name: '山田太郎', email: 'test@example.com', message: 'テストメッセージです。' }` | バリデーション成功 |
| UT-VAL-021 | 全フィールド空で複数エラーを返す | `{ name: '', email: '', message: '' }` | 3件のバリデーションエラー |
| UT-VAL-022 | 未定義フィールドでエラーを返す | `{}` | 3件のバリデーションエラー |

---

### 4.3 Atoms / Molecules / Organisms コンポーネント

**実装済みのテスト仕様は §4.7 を正本とする。**

本節にはかつて未実装時点の計画表（`UT-BTN-*` / `UT-HDR-*` 等）を置いていたが、issue #138 / #141 で
全コンポーネントのテストを実装した時点で、計画と実装が二重管理になり乖離した
（例: 廃止済みの `glass-card` / `bg-gradient-to-r` を期待値に含んでいた）。
テストは実装が正本であるため、計画表は削除し §4.7 へ一本化した。

| 階層 | コンポーネント | テスト仕様 |
|------|--------------|-----------|
| Atoms | `Button` / `Input` / `TextArea` / `Badge` / `ThemeToggle` | §4.7.2〜§4.7.6 |
| Molecules | `CareerCard` / `SocialLinks` / `ProductCard` / `ArticleEntry` / `AiPracticeEntry` / `SectionHeading` | §4.7.1 / §4.7.7 / §4.7.11 / §4.7.12 / §4.7.15 / §4.7.13 |
| Organisms | `Header` / `ContactForm` / セクション 8 件 | §4.7.8 / §4.7.9 / §4.7.13 |
| lib | `formatCareerPeriod` / `splitAboutContents` | §4.7.14 |
| Hooks | `useTheme` | §4.7.10 |

### 4.6 サイトURL解決とクローラ向けルート

#### 4.6.1 getSiteUrl関数 (`src/lib/site-url.ts`)

| テストID | 分類 | テストケース | 期待結果 |
|----------|------|------------|---------|
| UT-SITEURL-001 | 正常系 | `SITE_URL` 未設定 | `https://introtechkkplus.com/` |
| UT-SITEURL-002 | 正常系 | `SITE_URL` 設定あり | 設定値を優先する |
| UT-SITEURL-003 | 準正常系 | 末尾スラッシュの有無 | 同一オリジンに正規化される |
| UT-SITEURL-004 | 準正常系 | 前後に空白を含む値 | トリムして解釈する |
| UT-SITEURL-005 | 準正常系 | 空白のみの値 | 未設定扱いで正規オリジン |
| UT-SITEURL-006 | 異常系 | スキーム欠落（`introtechkkplus.com`） | 例外を投げず正規オリジン＋`console.warn` 1 回 |
| UT-SITEURL-007 | 異常系 | URL として解釈不能（`not a url`） | 例外を投げず正規オリジン＋`console.warn` 1 回 |
| UT-SITEURL-008 | 異常系 | 空文字 | 正規オリジン（警告は出さない） |

> メタデータ生成中の例外はページ全体を 500 にするため、不正値でも `throw` せずフォールバックする方針を固定している。

#### 4.6.2 sitemap (`src/app/sitemap.ts`)

| テストID | 分類 | テストケース | 期待結果 |
|----------|------|------------|---------|
| UT-SITEMAP-001 | 正常系 | エントリ件数 | トップページ 1 件のみ |
| UT-SITEMAP-002 | 正常系 | エントリ属性 | `changeFrequency: monthly` / `priority: 1` / `lastModified` が `Date` |
| UT-SITEMAP-003 | 準正常系 | `SITE_URL` 指定時 | 指定オリジンに追随する |
| UT-SITEMAP-004 | 準正常系 | `SITE_URL` が末尾スラッシュ付き | URL が二重スラッシュにならない |
| UT-SITEMAP-005 | 異常系 | `SITE_URL` が不正 | 例外を投げず正規オリジンで生成 |
| UT-SITEMAP-006 | 異常系 | `SITE_URL` が空文字 | 正規オリジンで生成 |

#### 4.6.3 robots (`src/app/robots.ts`)

| テストID | 分類 | テストケース | 期待結果 |
|----------|------|------------|---------|
| UT-ROBOTS-001 | 正常系 | ルール | `{ userAgent: '*', allow: '/' }` |
| UT-ROBOTS-002 | 正常系 | sitemap / host | `https://introtechkkplus.com/sitemap.xml` / `introtechkkplus.com` |
| UT-ROBOTS-003 | 準正常系 | `SITE_URL` 指定時 | 指定オリジンに追随する |
| UT-ROBOTS-004 | 準正常系 | `SITE_URL` が末尾スラッシュ付き | sitemap URL が二重スラッシュにならない |
| UT-ROBOTS-005 | 異常系 | `SITE_URL` が不正 | 例外を投げず正規オリジンで生成 |
| UT-ROBOTS-006 | 異常系 | `SITE_URL` が空文字 | 正規ホストを返す |

### 4.7 実装済みコンポーネントテスト

**issue #138 で `src/components/` に初めてユニットテストを追加し、issue #141 で全コンポーネントへ広げた。** JSX の変換は `vitest.config.ts` の `oxc: { jsx: { runtime: 'automatic' } }` で行う（Vite 8 のトランスフォーマは esbuild ではなく oxc のため、`esbuild: { jsx }` や `@vitejs/plugin-react` は効かない）。

合計 正常系 29 : 準正常系 + 異常系 89（`testing.md` の目安 1 : 2 以上を満たす）。

**検証の対象は見た目ではなく振る舞いと契約**とする。クラス名を期待値に書くのは、`variant` / `size` のようにクラスとしてしか観測できない props に限る。それ以外はロール・アクセシブルネーム・`aria-*`・`disabled` など、利用者と支援技術から見える性質で検証する。

#### 4.7.1 CareerCard (`src/components/molecules/CareerCard.tsx`)

正常系2 : 準正常系+異常系8。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-CC-001 | タイトル・期間・チーム規模・説明・役割を表示 | — |
| UT-CC-002 | 技術を分類ラベル付きで 1 件ずつチップ表示 | `TypeScript、PHP` のような連結文字列にならない |
| UT-CC-003 | 進行中は「現在」を表示 | — |
| UT-CC-004 | 過去は「現在」を表示しない | — |
| UT-CC-005 | 技術スタックが空なら見出しごと描画しない | — |
| UT-CC-006 | 担当フェーズが空なら見出しごと描画しない | — |
| UT-CC-007 | 担当フェーズは中黒区切りの 1 行 | `設計 ・ 実装 ・ テスト` |
| UT-CC-008 | 中身のある分類だけを出す | `Java8` + `Miracle Linux5~8` で テスト/設計 は出ない |
| UT-CC-009 | 未登録の技術は「その他」として表示 | 黙って消さない |
| UT-CC-010 | 役割が空文字でも見出しは残す | 項目の欠落が分かるようにする |

**導入時に、意図的に壊して落ちることを確認済み**（「現在」バッジを常時表示 / 分類のチップ連結を空白区切りへ変更 の 2 変異）。

#### 4.7.2 ThemeToggle (`src/components/atoms/ThemeToggle.tsx`)

正常系2 : 準正常系+異常系5。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-TT-001 | ダークを押すと `<html>` の `data-theme` が `dark` | — |
| UT-TT-002 | ライトを押すと `light` | — |
| UT-TT-003 | 選択を Cookie に保存する | リロード後にサーバーが読む |
| UT-TT-004 | 押す前は `data-theme` を設定しない | サーバーが出した値を上書きしない |
| UT-TT-005 | 連続して押すと最後の選択が残る | — |
| UT-TT-006 | 2 つのボタンが名前で特定できる | `role="group"` + 各 `aria-label` |
| UT-TT-007 | 記号 (○ / ●) は `aria-hidden` | 読み上げを汚さない |

#### 4.7.3 Badge (`src/components/atoms/Badge.tsx`)

正常系1 : 準正常系+異常系6。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-BDG-001 | 渡した内容を表示する | — |
| UT-BDG-002 | 既定はアクセント色 | `bg-acc` / `text-acc-on` |
| UT-BDG-003 | `outline` は枠線のみ | `bg-acc` を含まない |
| UT-BDG-004 | `className` を渡しても既定クラスが消えない | `cn()` は上書きでなく追加 |
| UT-BDG-005 | ネイティブ `span` 属性を透過する | — |
| UT-BDG-006 | `<span>` で描画する | 見出し行内に挟めるため。`<div>` だと改行される |
| UT-BDG-007 | 内容が空でも落ちない | — |

#### 4.7.4 Button (`src/components/atoms/Button.tsx`)

正常系1 : 準正常系+異常系8。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-BTN-001 | ラベル表示とクリック | ハンドラが 1 回呼ばれる |
| UT-BTN-002 | `isLoading` 中は押せない | `disabled` が立ち、二重送信されない |
| UT-BTN-003 | `isLoading` 中もラベルを残す | 何のボタンか分かる |
| UT-BTN-004 | `disabled` で押せない | — |
| UT-BTN-005 | 無効化が無ければ押せる | — |
| UT-BTN-006 | `variant` / `size` で見た目が変わる | クラスとしてしか観測できないため例外的にクラス検証 |
| UT-BTN-007 | `ref` を内部の `<button>` へ透過 | react-hook-form の `register()` 経路（issue #131 で一度破損） |
| UT-BTN-008 | スピナーは `aria-hidden` | 読み上げを汚さない |
| UT-BTN-009 | `type` を明示しない | フォーム内で submit として働く |

#### 4.7.5 Input (`src/components/atoms/Input.tsx`)

正常系1 : 準正常系+異常系9。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-INP-001 | ラベルから入力欄を特定でき、入力が反映される | `getByLabelText` で引けること自体が関連付けの証明 |
| UT-INP-002 | エラー時に `aria-invalid` とエラー文の紐付け | `toHaveAccessibleDescription` |
| UT-INP-003 | 補助説明の紐付け | `aria-invalid` は立てない |
| UT-INP-004 | エラーと補助説明が同時ならエラーのみ | `describedby` が両方を指さない |
| UT-INP-005 | 呼び出し側の `id` を優先 | — |
| UT-INP-006 | `label` 未指定ならラベルを描画しない | — |
| UT-INP-007 | `required` で必須の印を出す | — |
| UT-INP-008 | `ref` を内部の `<input>` へ透過 | — |
| UT-INP-009 | 2 つ置いても `id` が衝突しない | `useId` による生成 |
| UT-INP-010 | 空文字の `error` はエラー扱いにしない | 正常な欄が壊れて読み上げられない |

#### 4.7.6 TextArea (`src/components/atoms/TextArea.tsx`)

正常系1 : 準正常系+異常系9。`Input` と同じ契約を `textarea` 版として持つため、同等のケースを両方に置く（共通化するとどちらが壊れたか読みにくくなる）。`rows` の反映のみ `TextArea` 固有。

#### 4.7.7 SocialLinks (`src/components/molecules/SocialLinks.tsx`)

正常系1 : 準正常系+異常系7。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-SNS-001 | SNS 名をリンクとして表示し URL を設定 | — |
| UT-SNS-002 | 別タブで開き遷移先から操作されない | `target="_blank"` + `rel="noopener noreferrer"` |
| UT-SNS-003 | `aria-label` で行き先を補う | `{SNS名}のプロフィールを開く` |
| UT-SNS-004 | 渡した順に並べる | — |
| UT-SNS-005 | 0 件ならリンクを描画しない | — |
| UT-SNS-006 | `className` を渡しても既定レイアウトが消えない | — |
| UT-SNS-007 | `sns_img` を画面に出さない | 白一色 SVG は明るい地で見えないため（issue #135） |
| UT-SNS-008 | 同名でも URL が違えば両方描画 | 名前で束ねない |

#### 4.7.8 Header (`src/components/organisms/Header.tsx`)

正常系1 : 準正常系+異常系7。`Element.prototype.scrollIntoView` は jsdom 未実装のため spy を差し込む（モックは DOM API のみで、ナビの判定ロジックは実物を動かす）。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-HDR-001 | ロゴとナビを表示し、押すとスクロール | `scrollIntoView({ behavior: 'smooth' })` |
| UT-HDR-002 | モバイルメニューは初期状態で閉じている | `aria-expanded="false"` |
| UT-HDR-003 | 押すと開きナビ項目が増える | `aria-expanded="true"` |
| UT-HDR-004 | モバイルの項目を押すとスクロールして閉じる | — |
| UT-HDR-005 | テーマ切り替えを内包する | `role="group"` `配色テーマ` |
| UT-HDR-006 | 遷移先が無ければ何もしない | #127〜#129 の未実装セクションでも落ちない |
| UT-HDR-007 | ナビ項目が空でも描画できる | — |
| UT-HDR-008 | ナビは `<button>` のまま維持 | `<a>` にすると JS 無効でも遷移し、E2E のハイドレーション確認が無効化（issue #131） |

#### 4.7.9 ContactForm (`src/components/organisms/ContactForm.tsx`)

正常系1 : 準正常系+異常系9。モックは `fetch`（HTTP 通信）だけで、Zod 検証と react-hook-form の状態遷移は実物が動く。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-CTF-001 | 有効な入力で送信すると完了画面へ | `POST /api/contact` に入力値がそのまま載る |
| UT-CTF-002 | 未入力ではリクエストを飛ばさない | ネイティブ検証が submit を止める（後述） |
| UT-CTF-003 | メール形式が不正ならリクエストを飛ばさない | 同上（`validity.typeMismatch`） |
| UT-CTF-004 | 文字数不足は文字数エラーを出す | `min(1)` ではなく `min(2)` のメッセージ |
| UT-CTF-005 | 「新しいお問い合わせ」で空のフォームへ戻る | — |
| UT-CTF-006 | 完了画面は `role="status"` | 穏やかに通知する |
| UT-CTF-007 | サーバーエラーは `role="alert"`、入力は残す | やり直しで打ち直させない |
| UT-CTF-008 | エラー本文が無くても既定文言を出す | — |
| UT-CTF-009 | 通信失敗でも画面が壊れない | 送信ボタンが押せる状態へ戻る |
| UT-CTF-010 | 送信中はボタンを押せない | 二重送信の防止 |

> **クライアントで観測できない検証メッセージがある。** 各項目に `required` / `type="email"` を
> 付けているため、**空欄と不正なメール形式はブラウザのネイティブ検証が submit 自体を止め**、
> react-hook-form の `handleSubmit` まで到達しない。したがって `min(1)`（`お名前は必須です` 等）と
> `.email()`（`正しいメールアドレスを入力してください`）のメッセージはクライアントでは表示されず、
> 実際に効くのはサーバー側（`POST /api/contact`）の検証である。同じ前提は `e2e/contact.spec.ts` にも記録している。

#### 4.7.10 useTheme (`src/hooks/useTheme.ts`)

正常系1 : 準正常系+異常系5。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-UTH-001 | `applyTheme` が `data-theme` と Cookie を更新 | — |
| UT-UTH-002 | 呼ぶまで `data-theme` を設定しない | サーバーが出した値を上書きしない |
| UT-UTH-003 | 続けて呼ぶと最後の値が残る | — |
| UT-UTH-004 | 同じ値を 2 回適用しても結果が変わらない | 冪等 |
| UT-UTH-005 | 再レンダリングしても `applyTheme` の参照が変わらない | `useCallback` による安定化 |
| UT-UTH-006 | 状態を返さない | 「いまどちらか」は React では持たない |

**issue #141 でも変異注入で検出力を確認した**（`disabled` の解除 / `describedby` の付け替え / `id` 優先の無視 / `aria-invalid` の無効化 / `rel` の削除 / メニュー閉じ条件の緩和 / `useCallback` の除去 / `finally` の削除 / `variant` の統合 の 9 変異）。いずれも落ちることを確認済み。

#### 4.7.11 ProductCard (`src/components/molecules/ProductCard.tsx`)

正常系2 : 準正常系+異常系5（issue #128）。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-PC-001 | タイトル・概要・技術スタック・両方のリンクを表示 | — |
| UT-PC-002 | 外部リンクが別タブで開き、遷移先から操作されない | `target="_blank"` と `rel` の `noopener` / `noreferrer` を個別に確認 |
| UT-PC-003 | サイト URL が空なら site リンクを描画しない | repo リンクは残る |
| UT-PC-004 | リポジトリ URL が空なら repo リンクを描画しない | site リンクは残る |
| UT-PC-005 | 両方の URL が空ならリンクを 1 つも描画しない | リンク行ごと消える |
| UT-PC-006 | 技術スタックが空なら見出しごと描画しない | — |
| UT-PC-007 | 空白のみの URL は未設定として扱う | `"   "` / `"\t\n"` でリンクを出さない |

**`rel` を 2 語まとめて検証しない理由**: `noopener` が `window.opener` を切り、`noreferrer` が
Referer を落とす。役割が違うため、片方だけ消える退行を拾えるよう個別に確認する。

**空白のみの URL を異常系に置く理由**: GCS の JSON は手書きのため、消したつもりのフィールドに
空白が残りうる。空白を URL として扱うと、押しても何も起きないリンクが画面に出る。

**導入時に、意図的に壊して落ちることを確認済み**（`trim()` の除去 / `rel` から `noreferrer` を
削除 の 2 変異。いずれも該当テストのみが落ちた）。

#### 4.7.12 ArticleEntry (`src/components/molecules/ArticleEntry.tsx`)

正常系2 : 準正常系+異常系6（issue #127）。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-AE-001 | タイトル・媒体・公開年月・概要を表示し、タイトルをリンクにする | アクセシブル名は可視テキストのまま（`aria-label` で上書きしない） |
| UT-AE-002 | 外部リンクが別タブで開き、遷移先から操作されない | `target="_blank"` と `rel` の `noopener` / `noreferrer` を個別に確認 |
| UT-AE-003 | 媒体が空なら中黒を出さず公開年月だけを表示 | `・ 2024年5月` にならない |
| UT-AE-004 | 公開年月が空なら中黒を出さず媒体だけを表示 | `Zenn ・` にならない |
| UT-AE-005 | 媒体と公開年月がどちらも空ならメタ行ごと描画しない | タイトルと概要は残る |
| UT-AE-006 | 概要が空なら概要の段落を描画しない | — |
| UT-AE-007 | URL が空ならリンクにせず、タイトルを見出しとして残す | `<a>` 要素が 0 件 |
| UT-AE-008 | 空白のみの値は未設定として扱う | — |

**UT-AE-007 はロールではなく要素数で検証する。** `<a href="">` は**アクセシビリティツリー上で
link ロールを持たない**（href が空のため）。`queryAllByRole('link')` で書くと、リンク化のガードを
外しても 0 件のままで通ってしまい、**テストが何も守らない状態**になる。変異注入で実際に素通りする
ことを確認したうえで `container.querySelectorAll('a')` に改めた。

**導入時に、意図的に壊して落ちることを確認済み**（`trim()` の除去 / リンク化ガードの無効化 /
`rel` から `noreferrer` を削除 の 3 変異。いずれも該当テストが落ちた）。

#### 4.7.13 SectionHeading とセクション organisms

issue #153 で `client.tsx`（296 行）から切り出したコンポーネント群。

| コンポーネント | 正常系 | 準正常系+異常系 | 主に固定している挙動 |
|--------------|:---:|:---:|---|
| `SectionHeading` | 2 | 3 | 件数 `undefined` なら描画しない / **件数 0 なら `0` と出す** / 見出しが空でも罫線は残る |
| `HeroSection` | 1 | 3 | リードが無ければ引用パネルごと落とす / `startYear` が `null` なら `—` / 件数 0 も表示 |
| `AboutSection` | 2 | 3 | 氏名は `alt` にのみ使い本文に出さない / 段落 0 件・SNS 0 件でも崩れない / 件数を出さない |
| `CareerSection` | 2 | 3 | **配列順をそのまま表示順にする** / `career_end === 'now'` の解釈 / 不正日付は例外を伝播 |
| `ProductSection` | 1 | 3 | 0 件でも見出しと `0` / 説明文が空でも一覧は残る / 配列順を保つ |
| `ArticlesSection` | 1 | 3 | 0 件でも見出しと `0` / URL 空の記事だけリンクにしない / 配列順を保つ |
| `AiUsageSection` | 1 | 5 | **件数を出さない** / 詳細 URL が空・空白のみならリンクを描画しない / 方針 0 件でも見出し・原則・リンクは出す / 配列順を保つ |
| `ContactSection` | 1 | 2 | 見出しが空でもフォームは描画する / 件数を出さない |
| `SiteFooter` | 2 | 2 | ランドマーク `contentinfo` を出す / 値が空でも枠は残る |

**`AiUsageSection` の詳細リンクのガードは、`ArticleEntry`（UT-AE-007）と同じ理由で要素数
（`container.querySelectorAll('a')`）で検証する。** 導入時に、ガードの無効化 / `rel` から
`noreferrer` を削除 / `AiPracticeEntry` の `trim()` 除去 の 3 変異を入れ、いずれも該当テストが
落ちることを確認済み。

**「0 件のときに `0` と出す」を明示的に固定している。** `count && ...` のように falsy で
握りつぶす実装に変えると落ちる。0 件であることと、件数の概念が無いことは別の状態である。

**`CareerSection` の「配列順をそのまま表示順にする」も固定している。** GCS 側のデータは
「主プロジェクト → その関連・兼任プロジェクト」でグルーピングされており時系列降順ではない。
親切心で日付ソートを足すと、意図した並びが崩れる。

**`CareerSection` の異常系は「例外を投げること」を期待値にしている。** ここで握りつぶすと
「本文が無いのに 200 が返る」状態になるため、`page.tsx` まで伝播させ `error.tsx` に倒すのが
既存の方針（`page.tsx` の JSDoc 参照）。

#### 4.7.14 lib へ切り出したロジック

**どちらも issue #153 まで `client.tsx` の内部にあり、ユニットテストが一度も当たっていなかった**
（E2E 経由でしか踏まれていなかった）。

| 関数 | 正常系 | 準正常系+異常系 | 主に固定している挙動 |
|------|:---:|:---:|---|
| `formatCareerPeriod` | 2 | 4 | ゼロ埋めを外す / `'now'` は「現在」 / **実行時刻が変わっても `'now'` の表示は変わらない**（時刻を固定して確認）/ 不正形式は例外 |
| `splitAboutContents` | 1 | 4 | 2 番目の段落だけ Hero へ / 段落が足りなくても例外にしない / 文字列でない要素は落とす |

**`formatCareerPeriod` の「月跨ぎで表示がぶれない」を `vi.useFakeTimers()` で確かめている。**
`'now'` は `new Date()` として解釈されるが、その値は表示に使われない。コードを読めば分かる
ことだが、**うっかり `endYear` を使う実装に変えると年末年始にだけ壊れる**類の退行であり、
テストで固定する価値がある。

#### 4.7.15 AiPracticeEntry (`src/components/molecules/AiPracticeEntry.tsx`)

正常系1 : 準正常系+異常系3（issue #129）。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| UT-APE-001 | 方針の見出しと要約を表示する | 見出しは `h3` |
| UT-APE-002 | 要約が空なら段落を描画せず、見出しだけを残す | `<p>` 要素が 0 件 |
| UT-APE-003 | 空白のみの要約は未設定として扱う | `<p>` 要素が 0 件 |
| UT-APE-004 | 呼び出し側のクラスを既定のクラスと併せて適用する | 追加クラスと区切り罫（`border-b`）の両方が付く |

---

## 5. 統合テスト仕様

### 5.1 APIルート

#### 5.1.1 GET /api/portfolio (`src/app/api/portfolio/route.ts`)

| テストID | テストケース | 前提条件 | 期待結果 |
|----------|------------|---------|---------|
| IT-API-PF-001 | ポートフォリオデータを正常取得する | GCS接続成功（モック） | 200 OK + JSONデータ |
| IT-API-PF-002 | Cache-Control ヘッダーが設定される | 正常レスポンス | `public, s-maxage=300, stale-while-revalidate=86400` |
| IT-API-PF-003 | GCS接続エラー時に500エラーを返す | GCS接続失敗 | 500 + `{ error: 'ポートフォリオデータの取得に失敗しました' }` |
| IT-API-PF-004 | エラーレスポンスが `error` のみで内部詳細を含まない | GCS接続失敗 | `Object.keys(body)` が `['error']`（旧 `details` / `timestamp` は廃止） |
| IT-API-PF-005 | レスポンスがPortfolioData型に準拠する | 正常レスポンス | 全必須フィールドが存在する |

#### 5.1.2 POST /api/contact (`src/app/api/contact/route.ts`)

| テストID | テストケース | リクエストボディ | 期待結果 |
|----------|------------|----------------|---------|
| IT-API-CT-001 | 正常なお問い合わせを送信する | `{ name: '山田', email: 'test@example.com', message: 'テストメッセージ' }` | 200 + success: true |
| IT-API-CT-002 | 名前なしで400エラーを返す | `{ email: 'test@example.com', message: 'test' }` | 400 + エラーメッセージ |
| IT-API-CT-003 | メールなしで400エラーを返す | `{ name: '山田', message: 'test' }` | 400 + エラーメッセージ |
| IT-API-CT-004 | メッセージなしで400エラーを返す | `{ name: '山田', email: 'test@example.com' }` | 400 + エラーメッセージ |
| IT-API-CT-005 | 不正なメール形式で400エラーを返す | `{ name: '山田', email: 'invalid', message: 'テストメッセージ' }` | 400 + `'有効なメールアドレスを入力してください'` |
| IT-API-CT-006 | 5000文字超のメッセージで400エラーを返す | `{ name: '山田', email: 'test@example.com', message: 'a'.repeat(5001) }` | 400 + `'メッセージは5000文字以内で入力してください'` |
| IT-API-CT-007 | メール送信失敗時に500エラーを返す | 正常ボディ、Resend送信失敗（モック） | 500 + `'メールの送信に失敗しました...'` |
| IT-API-CT-008 | 不正なJSON形式で500エラーを返す | 不正なJSONボディ | 500 + `'サーバーエラーが発生しました...'` |
| IT-API-CT-009 | 成功レスポンスにmessageIdが含まれる | 正常送信 | messageId フィールドが存在する |
| IT-API-CT-011 | 同一クライアントからの6回目は429を返す | 不正ボディを5回送信後に6回目 | 429 + `Retry-After` > 0（バリデーション前に判定するためメール送信は発生しない） |
| IT-API-CT-012 | 件名の制御文字が除去されて送信される | `name: '山田\r\nBcc: attacker@example.com'` | `subject` に CR / LF を含まない（docs/06 §8.3） |
| IT-API-CT-010 | HTMLを含む入力がエスケープされて送信される | `{ name: '<b>山田</b>', message: '<img src="x" onerror="alert(1)"> …' }` | Resendへ渡る payload の `html` は実体参照化・`text` と `subject` は生値（docs/06 §8.1） |

### 5.2 データフェッチフロー

#### 5.2.1 portfolio (`src/repositories/portfolio.ts`)

| テストID | テストケース | 前提条件 | 期待結果 |
|----------|------------|---------|---------|
| IT-DS-001 | 開発環境でローカルデータを返す | NODE_ENV='development', sample.json存在 | ローカルデータが返却される |
| IT-DS-002 | 本番環境でGCSデータを返す | NODE_ENV='production', GCS接続成功 | GCSデータが返却される |
| IT-DS-003 | FORCE_GCS設定時にGCSから取得する | NODE_ENV='development', FORCE_GCS=true | GCSデータが返却される |
| IT-DS-004 | GCS失敗時にローカルデータにフォールバックする | NODE_ENV='development', GCS失敗, sample.json存在 | ローカルデータが返却される |
| IT-DS-005 | 本番環境でGCS失敗時にエラーを投げる | NODE_ENV='production', GCS失敗 | Error がスローされる |

#### 5.2.2 GCSクライアント (`src/repositories/gcs.ts`)

| テストID | テストケース | 前提条件 | 期待結果 |
|----------|------------|---------|---------|
| IT-GCS-001 | GCSからJSONデータを取得する | ファイル存在（モック） | パースされたJSONオブジェクトが返却される |
| IT-GCS-002 | ファイル未存在時にエラーを投げる | ファイル未存在（モック） | `Error: File ${jsonPath} not found` |
| IT-GCS-003 | バケット未存在時にエラーを投げる | バケット未存在（モック） | Error がスローされる |
| IT-GCS-004 | 不正なJSON時にエラーを投げる | ファイル内容が不正JSON（モック） | Error がスローされる |

#### 5.2.3 Resendクライアント (`src/repositories/resend.ts`)

| テストID | テストケース | 前提条件 | 期待結果 |
|----------|------------|---------|---------|
| IT-RS-001 | メールを正常に送信する | Resend API正常（モック） | `{ success: true, messageId: '...' }` |
| IT-RS-002 | RESEND_API_KEY未設定時にエラーを返す | RESEND_API_KEY=undefined | `{ success: false, error: 'RESEND_API_KEY is not configured' }` |
| IT-RS-003 | MY_MAIL_ADDRESS未設定時にエラーを返す | MY_MAIL_ADDRESS=undefined | `{ success: false, error: 'MY_MAIL_ADDRESS is not configured' }` |
| IT-RS-004 | RESEND_FROM_EMAIL未設定時にエラーを返す | RESEND_FROM_EMAIL=undefined | `{ success: false, error: 'RESEND_FROM_EMAIL is not configured' }` |
| IT-RS-005 | Resend API失敗時にエラーを返す | Resend API失敗（モック） | `{ success: false, error: '...' }` |
| IT-RS-006 | メール件名が正しいフォーマットになる | 正常送信 | `'ポートフォリオサイトからのお問い合わせ - ${name}様'` |
| IT-RS-007 | replyToに送信者メールが設定される | 正常送信 | replyTo に data.email が設定される |

---

## 6. E2Eテスト仕様

> **§6 は実装済みのテストだけを載せる**（issue #148）。§6.1〜§6.5 にはかつて E2E 導入前の計画表が
> 残っており、実在しない挙動（ローディング表示・Hero の CTA・ヘッダーの半透明化・Skills のグリッド）や、
> テストが確認していない期待結果（「紹介文が表示される」等）が載っていた。§4.3 の UT 計画表と同じく、
> **テストは実装が正本**として書き直した。どこにもテストが無かった計画行は issue #166 へ引き継ぎ、1 行ずつ採否を決めた（採用分は新しい ID で追記）。
>
> **ID は再利用しない。** 削除した行の ID（下表の各節に記載）は欠番とし、別のテストへ振り直さない。
> 過去の issue・PR・コミットに残る ID の意味が変わってしまうため。

### 6.1 ホームページ表示テスト

`e2e/home.spec.ts`「ホーム（正常系：GCS コンテナの実データ経路）」。1 つのテストで全セクションの見出しを
確認する。**見出しだけを見ており、本文の中身は検証していない**（本文は §6.12〜§6.15 と UT §4.7 が担う）。

| テストID | 分類 | テストケース | 期待結果 |
|----------|------|------------|---------|
| E2E-HOME-003 | 正常系 | Hero が表示される | `Solving Problems with Technology` の見出しが表示される。**Hero はサーバー側でデータを取得できた場合のみ描画される**ため、GCS コンテナからの取得成功の確認を兼ねる |
| E2E-HOME-004 | 正常系 | About が表示される | `About` の見出しが表示される |
| E2E-HOME-005 | 正常系 | Career が表示される | `Career` の見出しが表示される |
| E2E-HOME-011 | 正常系 | AI が表示される | `AI` の見出しが表示される |
| E2E-HOME-009 | 正常系 | Product が表示される | `Product` の見出しが表示される |
| E2E-HOME-010 | 正常系 | Articles が表示される | `Articles` の見出しが表示される |
| E2E-HOME-007 | 正常系 | Contact が表示される | `Contact` の見出しが表示される |
| E2E-HOME-008 | 正常系 | フッターが表示される | シードデータのコピーライト文が表示される |

> 行は表示順に並べている（ID は採番順）。**欠番**: E2E-HOME-001・002（ローディング表示。server-first 化
> issue #76 でローディング段階自体が無くなった。初期 HTML に本文が含まれることは §6.7 が担う）、
> E2E-HOME-006（Skills。issue #126 で削除）。

### 6.2 ナビゲーションテスト

`e2e/home.spec.ts`。

| テストID | 分類 | テストケース | 期待結果 |
|----------|------|------------|---------|
| E2E-NAV-004 | 正常系 | ヘッダーナビで Contact へ移動する | `#contact` がビューポートに入る |

md 幅（768px）での AI への移動は §6.15 の E2E-AI-002、CSP 適用下での移動（ハイドレーションの確認）は
§6.9 の E2E-SEC-006 が担う。

**モバイルメニューの開閉・項目選択後に閉じる挙動は UT で担保している**（§4.7.8 Header）。
開閉は React の状態で決まり、ブラウザ固有の振る舞いに依存しないため。

> **欠番**: E2E-NAV-001・002（About / Career への移動。issue #166 で**不採用**。どの項目も同じ
> `scrollToSection` を通り、NAV-004・AI-002・SEC-006 の 3 本で確認済みのため、足しても同じ経路をなぞるだけ）、
> E2E-NAV-003（Skills。issue #126 で削除）、E2E-NAV-005（Hero の「お問い合わせ」CTA。issue #138 で
> CTA ごと削除）、E2E-NAV-006（スクロール時のヘッダー半透明化。issue #138 でスクロール追従ごと廃止）、
> E2E-NAV-007・008（モバイルメニュー。上記のとおり UT で担保）。

### 6.3 お問い合わせフォームテスト

`e2e/contact.spec.ts`「お問い合わせフォーム」。`/api/contact` はブラウザ側で `page.route` によりスタブする
（Resend にエミュレータが無いため）。

| テストID | 分類 | テストケース | 期待結果 |
|----------|------|------------|---------|
| E2E-CF-001 | 準正常系 | 短すぎる入力で送信する | 名前・問い合わせ内容の文字数エラーが表示される |
| E2E-CF-002 | 正常系 | 正常な入力で送信する（API は 200） | `送信完了` の見出しと `お問い合わせありがとうございます。` が表示される |
| E2E-CF-006 | 異常系 | 送信が失敗する（API は 500） | API が返したエラーメッセージが表示される |

**E2E-CF-001 は「空欄」ではなく「短すぎる入力」で検証する。** 空欄はブラウザ標準の `required` 検証が
送信そのものを止めるため、zod のエラーメッセージは「空ではないが短すぎる」入力でしか観測できない。

**送信中の表示・完了画面から「新しいお問い合わせ」で戻る挙動は UT で担保している**（§4.7.9 ContactForm）。
フォームのアクセシビリティ（ラベル・`aria-invalid`・`role="alert"`）は §6.10。

> **欠番**: E2E-CF-003（送信中の表示）、E2E-CF-004・005（「新しいお問い合わせ」）。いずれも上記のとおり
> UT で担保。

### 6.4 レスポンシブデザインテスト

`e2e/home.spec.ts`「縦の余白リズム」「ナビの出し分け」。余白は**クラス名ではなく、実際に空いている距離を測る**。クラスを検査すると
「クラスは変わっていないが親の余白が増えて広がった」種類の退行を見逃すため。

| テストID | 分類 | テストケース | ビューポート | 期待結果 |
|----------|------|------------|------------|---------|
| E2E-RES-007 | 正常系 | セクション間の空きが経歴カード間のちょうど 2 倍になる | 1280 x 900 | カード間 40px、About→Career 80px。空きが 12→28→40→80px と倍で積み上がることで、どこが切れ目かを空き幅だけで読み取れる（issue #145） |
| E2E-RES-008 | 準正常系 | モバイル幅での空き | 390 x 844 | カード間 40px、About→Career 64px（lg 未満ではセクションの余白が 1 段落ちる） |
| E2E-RES-009 | 異常系 | どの幅でも横スクロールが出ない | 390 / 768 / 1280 | `scrollWidth` が `clientWidth` 以下 |
| E2E-RES-010 | 正常系 | デスクトップ幅のナビ | 1280 x 900 | 横並びナビの 6 項目が見え、ハンバーガーは出ない |
| E2E-RES-011 | 準正常系 | ブレークポイントの境界 | 768 → 767 | 768px で横並びナビ、767px でハンバーガーだけが出る |
| E2E-RES-012 | 準正常系 | モバイル幅でのメニュー経由の移動 | 390 x 844 | ハンバーガー → `Career` で `#career` がビューポートに入る |
| E2E-RES-013 | 異常系 | 開いたメニューが広い幅で二重に出ない | 390 → 1024 | メニューを開いたまま広げても、各ナビ項目が 1 件だけ引ける |

**E2E-RES-007 は比で固定している。** 両方を同時に動かす意図的な調整は通し、片方だけが動く事故を落とすため。

**E2E-RES-010〜013 は E2E でしか確かめられない。** 横並びナビ / ハンバーガーの出し分けは `md:flex` /
`md:hidden` の CSS だけで決まり、jsdom はメディアクエリを評価しない。`getByRole` は `display: none` の
要素を拾わないため、「見えている方だけが引ける」ことで出し分けを検証している。RES-011 で 767px も見るのは、
1280 / 390 だけではブレークポイントがずれても気づけないため（Tailwind の `md` は `min-width: 768px`）。
RES-013 は、開閉状態が React に残ったまま幅だけが変わるケースで、縦メニュー側の `md:hidden` が抜けると
同じ項目が 2 件並ぶ。開閉そのものは UT（§4.7.8）で担保している。

> **欠番**: E2E-RES-001〜003（各幅でのレイアウト崩れ。issue #166 で**不採用**。「崩れない」を機械的に
> 判定する手段が無く、スクリーンショット比較は OS・フォント差による揺れと基準画像の維持コストに見合わない。
> 測れる崩れは RES-007〜009 が担う）、E2E-RES-004・005（ナビの出し分け。issue #166 で RES-010〜013 として
> 実装）、E2E-RES-006（Skills のグリッド。issue #126 で削除）。

### 6.5 アクセシビリティテスト

`e2e/a11y.spec.ts`。ページ全体のキーボード操作と文書の言語宣言を見る。フォームのアクセシビリティは §6.10。

| テストID | 分類 | テストケース | 検証内容 |
|----------|------|------------|---------|
| E2E-A11Y-105 | 正常系 | Tab によるフォーカス順 | 1280px で先頭から Tab を押すと、ナビ 6 項目 → テーマ切替 2 ボタンの順にフォーカスが移る |
| E2E-A11Y-106 | 準正常系 | フォーカス表示 | Tab でページを一巡し（20 要素以上）、すべての要素で不透明な outline か ring が出ている |
| E2E-A11Y-107 | 準正常系 | キーボードでのモバイルメニュー | 390px で Tab 3 回でハンバーガーに届き、Enter で `aria-expanded="true"`、次の Tab で先頭項目へ入る |
| E2E-A11Y-108 | 正常系 | 言語宣言 | `/` の初期 HTML が `<html lang="ja">` を含む |
| E2E-A11Y-109 | 準正常系 | 404 ページの言語宣言 | `/no-such-page` が 404 を返し、初期 HTML が `lang="ja"` を含む（静的プリレンダーで別経路になるため） |

**E2E-A11Y-106 は outline のスタイルだけで判定しない。** Tailwind 3 の `outline-none` は
`outline: 2px solid transparent` であり、スタイルは `solid` のまま色だけが透明になる。多くの部品が
これで outline を消して `ring`（`box-shadow`）で代替しているため、outline は色の透明度まで、ring は
広がりかぼかしを持つ不透明な層があるかで判定する。jsdom は CSS を計算しないため UT では検出できない。
導入時、SocialLinks の `ring` を外すと 3 要素が名指しで報告されることを確認している。

その他の観点は次のとおり UT で担保している。

| 観点 | 担保している箇所 |
|------|----------------|
| 画像の `alt` | UT §4.7.13 AboutSection（画面で画像を描画するのはプロフィール画像の 1 箇所のみ） |
| SNS リンクの `aria-label` | UT §4.7.7 SocialLinks |
| 配色のコントラスト比（WCAG 2.1 AA） | UT §4.1.10 配色トークン（`globals.css` を解析して検証） |
| 外部リンクのアクセシブル名 | UT §4.7.11 ProductCard / §4.7.12 ArticleEntry / §4.7.13 AiUsageSection |

> **欠番**: E2E-A11Y-001〜006（計画のみ）。002（ラベルの関連付け）は §6.10 の E2E-A11Y-101・102、
> 001（画像の `alt`）・005（コントラスト比）・006（SNS の `aria-label`）は上表の UT で担保している。
> 003（キーボード操作）・004（`<html lang="ja">`）は issue #166 で A11Y-105〜109 として実装した。

### 6.6 SEOメタデータテスト

実装: `e2e/seo.spec.ts`。期待値を開発者の `.env.local` に左右されないよう、`playwright.config.ts` の
`webServer.env` で `SITE_URL` を正規オリジンに固定している（`next start` は本番モードでも `.env.local` を読むため）。

| テストID | 分類 | テストケース | 検証内容 |
|----------|------|------------|---------|
| E2E-SEO-001 | 正常系 | canonical / og:url | `https://introtechkkplus.com` の絶対 URL を指す |
| E2E-SEO-002 | 正常系 | sitemap.xml | 200 / Content-Type が XML / `<loc>` がトップ 1 件のみ |
| E2E-SEO-003 | 正常系 | robots.txt | 200 / `User-Agent: *` `Allow: /` `Host:` `Sitemap:` を含む |
| E2E-SEO-004 | 準正常系 | プレースホルダー残存の検出 | canonical / og:url に `localhost` `your-domain.com` `introtechkk.com` を含まない |
| E2E-SEO-005 | 準正常系 | 誤ブロックの検出 | robots.txt が `Disallow: /` を含まない |
| E2E-SEO-006 | 異常系 | HTTPS 担保 | sitemap.xml が `<loc>http://` を含まない（`security.md` 準拠） |
| E2E-SEO-007 | 異常系 | 移行漏れの検出 | robots.txt / sitemap.xml に旧ドメイン `introtechkk.com`・`your-domain.com`・`localhost` を含まない |
| E2E-SEO-008 | 異常系 | リンク切れの検出 | robots.txt の `Sitemap:` が指すパスが 200 を返す |

> **E2E-SEO-001 の注意**: Next.js は `metadataBase` に対する相対パス `/` の解決時にルートの末尾スラッシュを落とすため、
> canonical は `https://introtechkkplus.com`、sitemap の `<loc>` は `https://introtechkkplus.com/` と表記が異なる。
> ルート URL としては同一リソースを指す。

### 6.7 サーバーサイドレンダリングテスト

実装: `e2e/seo.spec.ts`。Playwright の `request` フィクスチャは JavaScript を実行しないため、
**ブラウザが JS を動かす前の生の HTML** を検証できる。JS を実行しない SNS のクローラが
見るものと同じ内容になる。

| テストID | 分類 | テストケース | 検証内容 |
|----------|------|------------|---------|
| E2E-SSR-001 | 正常系 | 初期 HTML の本文 | `Solving Problems with Technology` / `About` / `Career` / `AI` / `Product` / `Articles` / `Contact` を含む |
| E2E-SSR-002 | 準正常系 | 退行の検出 | `animate-spin` を含まず、タグ除去後の本文が 300 文字超 |

> **閾値の根拠**: 300 は E2E シードデータ基準（現状 973 文字）。データ取得が `useEffect` に
> 戻ると本文は 10 文字程度（`Loading...` のみ）まで落ちるため、桁で区別できる値にしている。
> 本番のデータ量とは無関係である点に注意。

### 6.8 データ取得失敗テスト

実装: `e2e/error.spec.ts`。**専用の webServer（ポート 3001）** で実行する。

`page.tsx` がサーバー側でデータ取得するようになったため、ブラウザで `/api/portfolio` を
スタブしてもページの描画には影響しない（サーバーの取得はブラウザを経由しないため）。
代わりに `GCS_JSON_PATH` を存在しないオブジェクトに向けたサーバを別ポートで起動し、
**本番と同じ経路で実際に取得を失敗させて** `error.tsx` の描画を検証する。

| テストID | 分類 | テストケース | 検証内容 |
|----------|------|------------|---------|
| E2E-ERR-001 | 異常系 | エラー画面の表示 | `Failed to load portfolio data` と `Try Again` / `Reload Page` ボタンが表示される |
| E2E-ERR-002 | 異常系 | 本文の非描画 | 失敗時に本文セクションの見出しが描画されない（空に近いページが 200 でインデックスされるのを防ぐ） |

#### Playwright の構成

```text
webServer: [
  { port 3000, GCS_JSON_PATH: 'json/portfolio.json' },       ← 正常系
  { port 3001, GCS_JSON_PATH: 'json/does-not-exist.json' },  ← 異常系
]
projects: [
  { name: 'chromium',       baseURL: :3000, testIgnore: error.spec.ts },
  { name: 'chromium-error', baseURL: :3001, testMatch:  error.spec.ts },
]
```

> **起動確認先に注意**: webServer の `url` は `/robots.txt`（静的ルート）を指す。`/` は
> サーバー側で GCS を叩くため、`globalSetup`（エミュレータ起動）より先に走る
> ヘルスチェックでは必ず失敗する。

### 6.9 セキュリティヘッダー・CSP テスト

`e2e/security.spec.ts`。CSP は「ヘッダーが付いているか」だけでなく「ブラウザが違反を報告しないか」まで見ないと、実質無効な設定を通してしまう。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| E2E-SEC-001 | 固定のセキュリティヘッダーが付与される | `X-Content-Type-Options` / `X-Frame-Options` / `Referrer-Policy` / `Strict-Transport-Security` |
| E2E-SEC-002 | CSP に nonce と `strict-dynamic` が含まれる | `script-src` に nonce、`'unsafe-eval'` を含まない（本番緩和漏れの検出） |
| E2E-SEC-003 | nonce はリクエストごとに変わる | 2 回取得した nonce が一致しない |
| E2E-SEC-004 | 静的プリレンダーされる 404 ページには CSP を付けない | `content-security-policy` が無く、`X-Frame-Options` は付く |
| E2E-SEC-005 | 404 ページのスクリプトがブロックされない | CSP 違反のコンソール出力が 0 件 |
| E2E-SEC-006 | CSP 違反なしでハイドレーションが完了する | 全 script に nonce、ヘッダーナビのクリックで `#contact` へスクロールする（onClick の scrollIntoView が動く＝ハイドレーション済み）、違反 0 件 |

### 6.10 フォームアクセシビリティテスト

実装: `e2e/contact.spec.ts`。**属性の有無ではなく実際に機能するか**で検証する。`<label>` を
描画していても `htmlFor` / `id` が無ければフォーカスは移らないため、クリックの結果で確かめる。

| テストID | 分類 | テストケース | 検証内容 |
|----------|------|------------|---------|
| E2E-A11Y-101 | 正常系 | ラベルクリック | 3 フィールドすべてでラベルをクリックすると対応する入力欄にフォーカスが移る |
| E2E-A11Y-102 | 正常系 | アクセシブルネーム | `getByLabel()` で 3 フィールドを取得できる |
| E2E-A11Y-103 | 準正常系 | 検証エラー時 | `aria-invalid="true"` が立ち、`aria-describedby` が指す要素に実際のエラー文が入っている |
| E2E-A11Y-104 | 異常系 | 送信失敗時 | フォーム内の `role="alert"` にエラーメッセージが通知される |

> **`getByRole('alert')` の注意**: Next.js はルート遷移の読み上げ用に `role="alert"` の要素
> （`#__next-route-announcer__`）を body 直下へ注入する。`getByRole('alert')` だけでは 2 件に
> マッチして strict mode violation になるため、`page.locator('form')` でスコープを限定している。

### 6.11 配色テーマ解決テスト

`e2e/theme.spec.ts`。テーマは Cookie を読んで**サーバー側で**解決し、初期 HTML に `data-theme` を載せる（docs/09 §6.7）。クライアントで適用すると「一度ライトで描画してからダークへ切り替わる」ちらつきが出るため、**JS を実行しない `request` 経由で HTML を取得**して属性の有無を確かめる。これがちらつかないことの根拠になる。

| テストID | テストケース | 操作手順 | 期待結果 |
|----------|------------|---------|---------|
| E2E-TH-001 | dark が初期 HTML に載る | `Cookie: theme=dark` で取得 | `data-theme="dark"` を含む |
| E2E-TH-002 | light が初期 HTML に載る | `Cookie: theme=light` で取得 | `data-theme="light"` を含む |
| E2E-TH-003 | Cookie 無しは属性を出さない | Cookie なしで取得 | `data-theme=` を含まない（OS 設定へ委ねる） |
| E2E-TH-004 | 未知の値は無視する | `theme=sepia` | `data-theme=` を含まない |
| E2E-TH-005 | 大文字は受け付けない | `theme=Dark` | `data-theme=` を含まない |
| E2E-TH-006 | 属性注入を無力化する | `theme=dark" onload="alert(1)` | `onload` も `data-theme=` も含まない |
| E2E-TH-007 | 他の Cookie が混ざっても theme だけ読む | `other=dark; theme=light; another=dark` | `data-theme="light"` |
| E2E-TH-008 | ハイドレーション後も値が変わらない | ブラウザで開いて描画完了を待つ | `data-theme` が `dark` のまま |
| E2E-TH-009 | トグルで切り替え、リロード後も保持される | ダーク→リロード→ライト→リロード | `data-theme` が追従する |
| E2E-TH-010 | テーマに応じてトークンの実効値が変わる | 切替後に `--paper` を評価 | `#14130f` / `#faf8f3`（クラス名だけ変わって色が同じ、を防ぐ） |
| E2E-TH-011 | スクロールバーと入力部品の配色も追従 | 切替後に `color-scheme` を評価 | `dark`（`<html>` に無いとブラウザ既定の部品へ効かない） |

### 6.12 経歴の技術スタック表示

`e2e/home.spec.ts`。分類集約（issue #137）が画面に適用されていることを確認する。

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| E2E-TS-001 | 技術を分類ごとにまとめて表示する | 分類見出し（言語）と技術が出る |
| E2E-TS-002 | 対応表に無い技術は「その他」として出る | 未分類を黙って隠さない設計の確認 |

---

### 6.13 個人開発のリンク出し分け

`e2e/home.spec.ts`（issue #128）。サイト未公開・リポジトリ非公開のプロダクトが実在するため、
**URL の有無による出し分けは表示仕様そのもの**になる。`sample.example.json` は片方だけ欠けた
2 件を意図的に含んでおり、シードデータがこのテストの前提になっている。

| テストID | 分類 | テストケース | 期待結果 |
|----------|------|------------|---------|
| E2E-PROD-001 | 準正常系 | リポジトリ非公開のプロダクト | site リンクは出るが repo リンクは出ない |
| E2E-PROD-002 | 準正常系 | サイト未公開のプロダクト | repo リンクは出るが site リンクは出ない |

UT（§4.7.11）と重なるが、**UT はコンポーネント単体の契約**、**E2E は実データ経路で同じ結果に
なること**を見ている。GCS から読んだ値が `client.tsx` を経て `ProductCard` へ正しく渡っているかは
UT では確認できない。

### 6.14 執筆記事の表示

`e2e/home.spec.ts`（issue #127）。

| テストID | 分類 | テストケース | 期待結果 |
|----------|------|------------|---------|
| E2E-ART-001 | 正常系 | 記事タイトルが外部リンクとして表示される | タイトルの表示テキストでリンクを引ける。`target="_blank"` と `rel` の `noopener` / `noreferrer` が付く。媒体と公開年月が `Zenn ・ 2024年5月` の形で 1 行に出る |

**表示テキストでリンクを引けること自体が仕様**である。`ArticleEntry` は `aria-label` を付けない設計
（タイトルが行き先を説明しているため）なので、`aria-label` を足す変更が入ると本テストが落ちる。

### 6.15 AI 活用の表示

`e2e/home.spec.ts`（issue #129）。

| テストID | 分類 | テストケース | 期待結果 |
|----------|------|------------|---------|
| E2E-AI-001 | 正常系 | 方針の要約と、詳細ページへの外部リンクが表示される | 方針の見出しが出る。`AIの詳細を新しいタブで開く` でリンクを引け、`href` がシードデータの URL、`target="_blank"` と `rel` の `noopener` / `noreferrer` が付く |
| E2E-AI-002 | 正常系 | md 幅（768px）でヘッダーナビから AI セクションへ移動する | `#ai-usage` がビューポートに入る |

**E2E-AI-002 を 768px で行うのは、ナビが横並びになる最小幅で 6 項目が最も窮屈になるため。**
ここで押せれば、それより広い幅でも押せる。

**詳細リンクは本セクションの導線そのもの**である。ポートフォリオ側は概要だけを持ち詳細は別サイトに
置く設計のため、リンクが消えるとセクションが要約だけで行き止まりになる。

---

## 7. パフォーマンステスト

### 7.1 Lighthouse指標目標

| メトリクス | 目標値 |
|-----------|--------|
| Performance | 90以上 |
| Accessibility | 95以上 |
| Best Practices | 95以上 |
| SEO | 95以上 |
| FCP (First Contentful Paint) | 1.5秒以内 |
| LCP (Largest Contentful Paint) | 2.5秒以内 |
| CLS (Cumulative Layout Shift) | 0.1以下 |
| TBT (Total Blocking Time) | 200ms以内 |

### 7.2 APIパフォーマンス

| テストID | テストケース | 期待結果 |
|----------|------------|---------|
| PT-API-001 | GET /api/portfolio の応答時間 | 500ms以内（キャッシュなし） |
| PT-API-002 | POST /api/contact の応答時間 | 3000ms以内 |
| PT-API-003 | GET /api/portfolio のキャッシュ効果 | 2回目以降のリクエストが100ms以内 |

---

## 8. モックデータ仕様

### 8.1 MSWハンドラー定義

テスト環境で使用するMSWハンドラーの定義方針を以下に示す。

```text
handlers.ts で定義すべきハンドラー:
  - GET /api/portfolio  → モックポートフォリオデータを返却
  - POST /api/contact   → 成功レスポンスを返却
  - GET /api/portfolio (エラーケース) → 500エラーを返却
  - POST /api/contact (エラーケース) → 500エラーを返却
```

### 8.2 モックポートフォリオデータ構造

テスト用モックデータは `PortfolioData` 型に完全準拠する必要がある。以下のフィールドがすべて定義されていること。

| フィールド | 型 | モック値の要件 |
|-----------|-----|--------------|
| navbar_data | NavbarData | link_title, about_name, career_name, contact_name が非空文字列 |
| hero_data | HeroData | hero_img_url が有効なURL形式 |
| about_data | AboutData | about_name, about_img_url が非空、sns_list が1件以上、about_contents が1件以上 |
| career_title_data | CareerTitleData | 全フィールドが非空文字列 |
| career_data | CareerData[] | 1件以上のキャリアデータ（career_end='now' のケースを含む） |
| contact_data | ContactData | 全フィールドが非空文字列 |
| footer_data | FooterData | copyright が非空文字列 |

---

## 9. CI/CD テスト統合

### 9.1 GitHub Actions ワークフロー

テストを CI パイプラインに統合するための推奨ワークフロー構成を以下に示す。

```text
テスト実行フロー:
  1. 型チェック (tsc --noEmit)          ← 実装済み（ci.yml）
  2. リント (eslint .)                  ← 実装済み（ci.yml。ESLint + JSDoc）
  3. フォーマットチェック (prettier --check .)  ← 実装済み（ci.yml。.prettierignore でコードのみ対象）
  4. ユニットテスト (vitest run)         ← 実装済み（ci.yml。ユーティリティ・コンポーネント・フック）
  5. 統合テスト (vitest run --config …)   ← 実装済み（ci.yml。Testcontainers + MSW。要 Docker）
  6. ビルド (next build)                 ← 実装済み（e2e.yml で E2E の前に実行。デプロイ時も deploy_to_googlecloud.yml で実行）
  7. E2Eテスト (playwright test)         ← 実装済み（e2e.yml。Playwright + fake-gcs-server。要 Docker）
```

> **現状**: 1〜5 は `main` 宛 PR で走る `ci.yml`、6〜7 は同じく PR で走る `e2e.yml` として実装済み（E2E はブラウザ・ビルド・Docker を要し重いため別ワークフローに分離）。カバレッジ閾値は未導入。

### 9.2 実行条件

| トリガー | 実行テスト |
|---------|-----------|
| Pull Request 作成・更新 | 型チェック + リント + ユニットテスト + 統合テスト |
| mainブランチへのマージ | 全テスト（E2E含む） |
| スケジュール実行（日次） | 全テスト + パフォーマンステスト |

### 9.3 テスト失敗時のポリシー

| 状況 | アクション |
|------|-----------|
| ユニットテスト失敗 | PR マージをブロック |
| 統合テスト失敗 | PR マージをブロック |
| E2Eテスト失敗 | PR マージをブロック（mainブランチマージ時のみ） |
| カバレッジが閾値未満 | 警告表示（ブロックはしない） |

---

## 10. テスト実装優先順位

導入にあたっての推奨実装順序を以下に定義する。

### フェーズ1: 基盤構築（優先度: 高）

1. テストフレームワーク（Vitest）のセットアップ
2. ユーティリティ関数のユニットテスト（cn, toDateString, validation）
3. Atomsコンポーネントのユニットテスト（Button, Input, TextArea, Badge）

### フェーズ2: コア機能テスト（優先度: 高）

1. APIルートの統合テスト（portfolio, contact）
2. Moleculesコンポーネントのユニットテスト（CareerCard, SocialLinks）
3. データフェッチフローの統合テスト（portfolio, gcs, resend）

### フェーズ3: 画面テスト（優先度: 中）

1. Organismsコンポーネントのユニットテスト（Header, ContactForm）
2. ページコンポーネントの統合テスト（page.tsx）

### フェーズ4: E2E・品質テスト（優先度: 中）

1. Playwright セットアップと主要シナリオのE2Eテスト
2. レスポンシブデザインテスト
3. アクセシビリティテスト

### フェーズ5: CI/CD統合（優先度: 低）

 1. GitHub Actions ワークフロー構築
 2. カバレッジレポートの自動生成
 3. パフォーマンステストの自動化
