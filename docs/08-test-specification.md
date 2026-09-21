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
    - [4.3 Atomsコンポーネント](#43-atomsコンポーネント)
        - [4.3.1 Button (`src/components/atoms/Button.tsx`)](#431-button-srccomponentsatomsbuttontsx)
        - [4.3.2 Input (`src/components/atoms/Input.tsx`)](#432-input-srccomponentsatomsinputtsx)
        - [4.3.3 TextArea (`src/components/atoms/TextArea.tsx`)](#433-textarea-srccomponentsatomstextareatsx)
        - [4.3.4 Badge (`src/components/atoms/Badge.tsx`)](#434-badge-srccomponentsatomsbadgetsx)
    - [4.4 Moleculesコンポーネント](#44-moleculesコンポーネント)
        - [4.4.1 CareerCard (`src/components/molecules/CareerCard.tsx`)](#441-careercard-srccomponentsmoleculescareercardtsx)
        - [4.4.2 SocialLinks (`src/components/molecules/SocialLinks.tsx`)](#442-sociallinks-srccomponentsmoleculessociallinkstsx)
    - [4.5 Organismsコンポーネント](#45-organismsコンポーネント)
        - [4.5.1 Header (`src/components/organisms/Header.tsx`)](#451-header-srccomponentsorganismsheadertsx)
        - [4.5.2 ContactForm (`src/components/organisms/ContactForm.tsx`)](#452-contactform-srccomponentsorganismscontactformtsx)
    - [4.6 サイトURL解決とクローラ向けルート](#46-サイトurl解決とクローラ向けルート)
        - [4.6.1 getSiteUrl関数 (`src/lib/site-url.ts`)](#461-getsiteurl関数-srclibsite-urlts)
        - [4.6.2 sitemap (`src/app/sitemap.ts`)](#462-sitemap-srcappsitemapts)
        - [4.6.3 robots (`src/app/robots.ts`)](#463-robots-srcapprobotsts)
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

- **ユニットテスト**: ユーティリティ関数 3 ファイル（`cn` / `toDateString` / `ContactFormSchema`、計 33 ケース）を実装済み（`vitest.config.ts`）。
- **統合テスト**: `*.integration.test.ts`（`vitest.integration.config.ts` + `pnpm test:it`）を実装済み、計 10 ケース。**GCS は `fsouza/fake-gcs-server` コンテナ（Testcontainers）で実データ経路を検証**し、**Resend は MSW で HTTP をモック**（testing.md: 外部 I/O のみモック）。対象は `GET /api/portfolio`・`POST /api/contact`・`gcs.getPortfolioDataFromGCS`。要 Docker。
  - GCS エミュレータ接続は `gcs.ts` の `GCS_API_ENDPOINT`（本番未設定）で `apiEndpoint` を上書きして実現。
  - この IT により、`resend.ts` が Resend の HTTP エラーを成功扱いする不具合を検出・修正した（`result.error` を検査するよう修正、`docs/11` #50）。

- **E2E テスト**: Playwright で `e2e/` にシナリオテストを実装済み、計 7 ケース（`pnpm test:e2e`）。**ポートフォリオ表示は fake-gcs-server コンテナの実データ**（本番ビルドのサーバを `GCS_API_ENDPOINT` でコンテナへ向ける）、**お問い合わせ送信・失敗系はブラウザで `page.route` により API をスタブ**（Resend はエミュレータ無し）。正常/準正常/異常を網羅。flaky 対策として CI では `retries: 2` + 失敗時 trace/screenshot/video。専用ワークフロー `.github/workflows/e2e.yml`（PR）で実行。要 Docker + `pnpm build`。
  - E2E 導入時に、`/api/portfolio` がビルド時プリレンダーされ実行時に GCS を参照しない不具合を検出・修正した（`export const dynamic = 'force-dynamic'`、`docs/11` #51）。

一方、コンポーネントテストは未実装。`@vitejs/plugin-react` は TypeScript 5.5.2 と非互換のため未導入で、React コンポーネントテストを追加する際に TS 5.5 互換の JSX 設定を別途整える必要がある。

本仕様書では、プロジェクトの品質保証を目的として、目標とするテスト戦略とテストケースを包括的に定義する（未実装部分は今後の指針）。

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

### 4.3 Atomsコンポーネント

#### 4.3.1 Button (`src/components/atoms/Button.tsx`)

| テストID | テストケース | 検証内容 |
|----------|------------|---------|
| UT-BTN-001 | デフォルトpropsでレンダリングされる | variant='primary'、size='md' のスタイルが適用される |
| UT-BTN-002 | children が正しく表示される | テキスト内容が DOM に反映される |
| UT-BTN-003 | variant='primary' のスタイルが適用される | glass-card, bg-gradient-to-r クラスが含まれる |
| UT-BTN-004 | variant='secondary' のスタイルが適用される | glass-effect クラスが含まれる |
| UT-BTN-005 | variant='outline' のスタイルが適用される | border-2, border-primary-400/50 クラスが含まれる |
| UT-BTN-006 | variant='ghost' のスタイルが適用される | text-secondary-300 クラスが含まれる |
| UT-BTN-007 | size='sm' のサイズが適用される | h-8 px-3 text-sm クラスが含まれる |
| UT-BTN-008 | size='lg' のサイズが適用される | h-12 px-6 text-lg クラスが含まれる |
| UT-BTN-009 | isLoading=true でスピナーが表示される | SVGスピナー要素が描画される |
| UT-BTN-010 | isLoading=true でボタンが無効化される | disabled属性がtrueになる |
| UT-BTN-011 | disabled=true でボタンが無効化される | disabled属性がtrueになる、opacity-50が適用される |
| UT-BTN-012 | onClick ハンドラが呼ばれる | ボタンクリック時にコールバックが実行される |
| UT-BTN-013 | ref が正しくフォワードされる | React.createRef で参照可能 |
| UT-BTN-014 | className が追加される | カスタムクラスが既存クラスとマージされる |

#### 4.3.2 Input (`src/components/atoms/Input.tsx`)

| テストID | テストケース | 検証内容 |
|----------|------------|---------|
| UT-INP-001 | デフォルトpropsでレンダリングされる | input要素がtype='text'で描画される |
| UT-INP-002 | label が表示される | label要素にテキストが反映される |
| UT-INP-003 | required時に「*」マークが表示される | label内にtext-red-400のspan要素が存在する |
| UT-INP-004 | error メッセージが表示される | text-red-400 のエラーテキストが描画される |
| UT-INP-005 | error時にボーダーカラーが変わる | border-red-400/50 クラスが適用される |
| UT-INP-006 | hint テキストが表示される | text-secondary-400 のヒントテキストが描画される |
| UT-INP-007 | error がある場合 hint は非表示になる | error表示時にhint要素が存在しない |
| UT-INP-008 | ref が正しくフォワードされる | React.createRef で参照可能 |
| UT-INP-009 | placeholder が表示される | placeholder属性が反映される |
| UT-INP-010 | type='email' が適用される | input要素のtype属性がemailになる |

#### 4.3.3 TextArea (`src/components/atoms/TextArea.tsx`)

| テストID | テストケース | 検証内容 |
|----------|------------|---------|
| UT-TA-001 | デフォルトpropsでレンダリングされる | textarea要素が描画される |
| UT-TA-002 | label が表示される | label要素にテキストが反映される |
| UT-TA-003 | required時に「*」マークが表示される | label内にtext-red-400のspan要素が存在する |
| UT-TA-004 | error メッセージが表示される | text-red-400 のエラーテキストが描画される |
| UT-TA-005 | hint テキストが表示される（errorなし時） | text-secondary-400 のヒントテキストが描画される |
| UT-TA-006 | rows属性が反映される | textarea要素のrows属性が設定値と一致する |
| UT-TA-007 | ref が正しくフォワードされる | React.createRef で参照可能 |

#### 4.3.4 Badge (`src/components/atoms/Badge.tsx`)

| テストID | テストケース | 検証内容 |
|----------|------------|---------|
| UT-BDG-001 | デフォルトpropsでレンダリングされる | variant='default'、size='md' のスタイルが適用される |
| UT-BDG-002 | children が正しく表示される | テキスト内容が DOM に反映される |
| UT-BDG-003 | variant='secondary' のスタイルが適用される | border-secondary-400/30 クラスが含まれる |
| UT-BDG-004 | variant='accent' のスタイルが適用される | border-accent-400/30 クラスが含まれる |
| UT-BDG-005 | variant='outline' のスタイルが適用される | border-white/20 クラスが含まれる |
| UT-BDG-006 | size='sm' のサイズが適用される | px-2 py-0.5 text-xs クラスが含まれる |

---

### 4.4 Moleculesコンポーネント

#### 4.4.1 CareerCard (`src/components/molecules/CareerCard.tsx`)

| テストID | テストケース | 検証内容 |
|----------|------------|---------|
| UT-CRC-001 | タイトルが表示される | h3要素にタイトルが反映される |
| UT-CRC-002 | 期間が表示される | 期間テキストが描画される |
| UT-CRC-003 | チームサイズが表示される | チームサイズテキストが描画される |
| UT-CRC-004 | 説明文が表示される | p要素に説明文が反映される |
| UT-CRC-005 | 技術スタックがBadgeとして表示される | techStack配列の各要素がBadgeコンポーネントとして描画される |
| UT-CRC-006 | 担当フェーズがBadgeとして表示される | phases配列の各要素がBadgeコンポーネントとして描画される |
| UT-CRC-007 | 役割が表示される | 役割テキストが描画される |
| UT-CRC-008 | isCurrent=true で「現在」バッジが表示される | accent variant の Badge に「現在」テキストが含まれる |
| UT-CRC-009 | isCurrent=false で「現在」バッジが非表示になる | 「現在」テキストが DOM に存在しない |
| UT-CRC-010 | 空の技術スタック配列で正常描画される | techStack=[] でクラッシュしない |
| UT-CRC-011 | 空のフェーズ配列で正常描画される | phases=[] でクラッシュしない |

#### 4.4.2 SocialLinks (`src/components/molecules/SocialLinks.tsx`)

| テストID | テストケース | 検証内容 |
|----------|------------|---------|
| UT-SL-001 | SNSリンクが正しい数だけ表示される | links配列の数とa要素の数が一致する |
| UT-SL-002 | 各リンクが新しいタブで開く設定になっている | target='_blank' が設定される |
| UT-SL-003 | noopener noreferrer が設定される | rel属性に 'noopener noreferrer' が含まれる |
| UT-SL-004 | aria-label が正しく設定される | `${sns_name}のプロフィールを開く` 形式のaria-labelが設定される |
| UT-SL-005 | size='sm' でアイコンサイズが24pxになる | Image の width/height が 24 になる |
| UT-SL-006 | size='lg' でアイコンサイズが40pxになる | Image の width/height が 40 になる |
| UT-SL-007 | 空のlinks配列でクラッシュしない | links=[] でエラーが発生しない |

---

### 4.5 Organismsコンポーネント

#### 4.5.1 Header (`src/components/organisms/Header.tsx`)

| テストID | テストケース | 検証内容 |
|----------|------------|---------|
| UT-HDR-001 | ロゴテキストが表示される | h1要素にlogoプロパティのテキストが表示される |
| UT-HDR-002 | ナビゲーション項目が表示される | navItems配列の各nameがボタンテキストとして描画される |
| UT-HDR-003 | デスクトップナビがmd以上で表示される | 'hidden md:flex' クラスがnav要素に適用される |
| UT-HDR-004 | モバイルメニューボタンが表示される | aria-label='メニューを開く' のボタンが存在する |
| UT-HDR-005 | モバイルメニューが初期非表示になる | モバイルメニュー領域が初期状態で描画されない |
| UT-HDR-006 | モバイルメニューボタンクリックでメニューが開く | クリック後にモバイルナビゲーション領域が描画される |
| UT-HDR-007 | スクロール時にglass-effectが適用される | window.scrollY > 10 でヘッダーにglass-effectクラスが追加される |
| UT-HDR-008 | スクロール前はbg-transparentが適用される | 初期状態でbg-transparentクラスが適用される |

#### 4.5.2 ContactForm (`src/components/organisms/ContactForm.tsx`)

| テストID | テストケース | 検証内容 |
|----------|------------|---------|
| UT-CF-001 | フォームが正しくレンダリングされる | 名前入力、メール入力、メッセージ入力、送信ボタンが描画される |
| UT-CF-002 | 各入力フィールドにlabelが表示される | 「お名前」「メールアドレス」「お問い合わせ内容」ラベルが表示される |
| UT-CF-003 | 空フォーム送信でバリデーションエラーが表示される | 各フィールドのエラーメッセージが表示される |
| UT-CF-004 | 正常値入力後に送信できる | フォーム送信後にfetchが呼ばれる |
| UT-CF-005 | 送信中にローディング状態になる | 「送信中...」テキストが表示される |
| UT-CF-006 | 送信成功後に完了メッセージが表示される | 「送信完了」「お問い合わせありがとうございます」が表示される |
| UT-CF-007 | 送信失敗時にエラーメッセージが表示される | text-red-300 のエラーメッセージが表示される |
| UT-CF-008 | 「新しいお問い合わせ」ボタンでフォームに戻る | 完了状態からボタンクリックでフォームが再表示される |
| UT-CF-009 | 名前の最小文字数バリデーションが機能する | 1文字入力で「2文字以上」エラーが表示される |
| UT-CF-010 | メールアドレスの形式バリデーションが機能する | 不正形式で「正しいメールアドレスを入力してください」エラーが表示される |
| UT-CF-011 | メッセージの最小文字数バリデーションが機能する | 9文字以下で「10文字以上」エラーが表示される |

---

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

### 6.1 ホームページ表示テスト

| テストID | テストケース | 操作手順 | 期待結果 |
|----------|------------|---------|---------|
| E2E-HOME-001 | ページが正常にロードされる | トップページにアクセス | ローディング後にコンテンツが表示される |
| E2E-HOME-002 | ローディングスピナーが表示される | トップページにアクセス | 「Loading...」テキストとスピナーが一時的に表示される |
| E2E-HOME-003 | Heroセクションが表示される | ページロード完了を待機 | 「Solving Problems with Technology」見出しが表示される |
| E2E-HOME-004 | Aboutセクションが表示される | #about にスクロール | About見出しと紹介文が表示される |
| E2E-HOME-005 | Careerセクションが表示される | #career にスクロール | Career見出しと経歴カードが表示される |
| E2E-HOME-007 | Contactセクションが表示される | #contact にスクロール | Contact見出しとフォームが表示される |
| E2E-HOME-008 | フッターが表示される | ページ最下部にスクロール | コピーライト文が表示される |

### 6.2 ナビゲーションテスト

| テストID | テストケース | 操作手順 | 期待結果 |
|----------|------------|---------|---------|
| E2E-NAV-001 | ヘッダーナビゲーションでAboutに移動する | 「About」ボタンをクリック | #about セクションまでスムーズスクロールする |
| E2E-NAV-002 | ヘッダーナビゲーションでCareerに移動する | 「Career」ボタンをクリック | #career セクションまでスムーズスクロールする |
| E2E-NAV-004 | ヘッダーナビゲーションでContactに移動する | 「Contact」ボタンをクリック | #contact セクションまでスムーズスクロールする |
| E2E-NAV-005 | Heroの「お問い合わせ」ボタンでContactに移動する | 「お問い合わせ」ボタンをクリック | #contact セクションまでスムーズスクロールする |
| E2E-NAV-006 | スクロール時にヘッダーが半透明になる | 下方にスクロール | ヘッダーにglass-effectが適用される |
| E2E-NAV-007 | モバイルメニューが開閉する | ハンバーガーメニューをクリック | モバイルナビゲーションの表示/非表示が切り替わる |
| E2E-NAV-008 | モバイルメニュー項目クリックでメニューが閉じる | モバイルメニュー項目をクリック | メニューが閉じてセクションにスクロールする |

### 6.3 お問い合わせフォームテスト

| テストID | テストケース | 操作手順 | 期待結果 |
|----------|------------|---------|---------|
| E2E-CF-001 | 空フォーム送信でバリデーションエラーが表示される | 空のまま送信ボタンをクリック | 各フィールドのエラーメッセージが表示される |
| E2E-CF-002 | 正常な値で送信が成功する | 正常値を入力して送信 | 「送信完了」メッセージが表示される |
| E2E-CF-003 | 送信中にローディング表示になる | フォーム送信 | 「送信中...」テキストとスピナーが表示される |
| E2E-CF-004 | 送信完了後に「新しいお問い合わせ」ボタンが表示される | フォーム送信成功後 | 「新しいお問い合わせ」ボタンが表示される |
| E2E-CF-005 | 「新しいお問い合わせ」クリックでフォームに戻る | 「新しいお問い合わせ」ボタンをクリック | フォームが再表示され、入力フィールドが空になる |
| E2E-CF-006 | API接続エラー時にエラーメッセージが表示される | ネットワークエラーをシミュレート | エラーメッセージが表示される |

### 6.4 レスポンシブデザインテスト

| テストID | テストケース | ビューポート | 期待結果 |
|----------|------------|------------|---------|
| E2E-RES-001 | モバイル表示でレイアウトが崩れない | 375 x 667 (iPhone SE) | 全セクションが正常表示される |
| E2E-RES-002 | タブレット表示でレイアウトが崩れない | 768 x 1024 (iPad) | 全セクションが正常表示される |
| E2E-RES-003 | デスクトップ表示でレイアウトが崩れない | 1920 x 1080 | 全セクションが正常表示される |
| E2E-RES-004 | モバイルでハンバーガーメニューが表示される | 375 x 667 | ハンバーガーアイコンが表示される |
| E2E-RES-005 | デスクトップでナビゲーションバーが表示される | 1920 x 1080 | 横並びのナビゲーション項目が表示される |
| E2E-RES-006 | スキルカードのグリッドが画面幅に応じて変化する | 各ビューポート | モバイル: 1列、md: 2列、lg: 3列、xl: 4列 |

### 6.5 アクセシビリティテスト

| テストID | テストケース | 検証内容 |
|----------|------------|---------|
| E2E-A11Y-001 | 画像にalt属性が設定されている | 全Image要素にalt属性が存在する |
| E2E-A11Y-002 | フォーム要素にlabelが関連付けられている | label要素とinput/textarea要素が対応している |
| E2E-A11Y-003 | インタラクティブ要素にキーボードアクセス可能 | Tabキーで全ボタン・リンクにフォーカスが移動する |
| E2E-A11Y-004 | html要素にlang='ja'が設定されている | ドキュメントの言語属性が正しい |
| E2E-A11Y-005 | コントラスト比が十分である | 主要テキストのコントラスト比がWCAG AA基準を満たす |
| E2E-A11Y-006 | SNSリンクにaria-labelが設定されている | 各SNSリンクに適切なaria-labelが存在する |

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
| E2E-SSR-001 | 正常系 | 初期 HTML の本文 | `Solving Problems with Technology` / `About` / `Career` / `Contact` を含む |
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
  2. リント (next lint)                 ← 実装済み（ci.yml。ESLint + JSDoc）
  3. フォーマットチェック (prettier --check .)  ← 実装済み（ci.yml。.prettierignore でコードのみ対象）
  4. ユニットテスト (vitest run)         ← 実装済み（ci.yml。ユーティリティ UT）
  5. 統合テスト (vitest run --config …)   ← 実装済み（ci.yml。Testcontainers + MSW。要 Docker）
  6. ビルド (next build)                 ← デプロイ時に実行（deploy_to_googlecloud.yml）
  7. E2Eテスト (playwright test)         ← 未実装
```

> **現状**: 上記 1〜5（型チェック・Lint・フォーマットチェック・ユニットテスト・統合テスト）は `main` 宛 PR で走る `ci.yml` として実装済み。カバレッジ閾値・7 の E2E は未導入（`docs/08` §1.1 参照）。6 のビルドはデプロイワークフロー内で実行される。

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
