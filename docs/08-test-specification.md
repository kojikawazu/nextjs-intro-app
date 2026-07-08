# テスト仕様書

> ℹ️ **テスト基盤は導入済み（Vitest + Testing Library）。現状はユーティリティ関数のユニットテストのみ実装**しています。`cn`（`src/utils/cn.test.ts`）/ `toDateString`（`src/lib/costom-date.test.ts`）/ `ContactFormSchema`（`src/utils/validation.test.ts`）の 3 ファイル・計 30 ケースが実装・PASS 済みで、CI（`.github/workflows/ci.yml`）の `pnpm test:run` で実行されます。コンポーネント / API Route / データフェッチ / E2E テスト、および MSW・Playwright は**未導入（今後の計画）**です。本書のうち未導入部分は導入時の指針であり、実在するコードではありません。

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
        - [4.1.2 toDateString関数 (`src/lib/costom-date.ts`)](#412-todatestring関数-srclibcostom-datets)
        - [4.1.3 formatCareerPeriod関数 (`src/app/page.tsx` 内)](#413-formatcareerperiod関数-srcapppagetsx-内)
    - [4.2 バリデーションロジック](#42-バリデーションロジック)
        - [4.2.1 ContactFormSchema (`src/utils/validation.ts`)](#421-contactformschema-srcutilsvalidationts)
    - [4.3 Atomsコンポーネント](#43-atomsコンポーネント)
        - [4.3.1 Button (`src/components/atoms/Button.tsx`)](#431-button-srccomponentsatomsbuttontsx)
        - [4.3.2 Input (`src/components/atoms/Input.tsx`)](#432-input-srccomponentsatomsinputtsx)
        - [4.3.3 TextArea (`src/components/atoms/TextArea.tsx`)](#433-textarea-srccomponentsatomstextareatsx)
        - [4.3.4 Badge (`src/components/atoms/Badge.tsx`)](#434-badge-srccomponentsatomsbadgetsx)
    - [4.4 Moleculesコンポーネント](#44-moleculesコンポーネント)
        - [4.4.1 SkillCard (`src/components/molecules/SkillCard.tsx`)](#441-skillcard-srccomponentsmoleculesskillcardtsx)
        - [4.4.2 CareerCard (`src/components/molecules/CareerCard.tsx`)](#442-careercard-srccomponentsmoleculescareercardtsx)
        - [4.4.3 SocialLinks (`src/components/molecules/SocialLinks.tsx`)](#443-sociallinks-srccomponentsmoleculessociallinkstsx)
    - [4.5 Organismsコンポーネント](#45-organismsコンポーネント)
        - [4.5.1 Header (`src/components/organisms/Header.tsx`)](#451-header-srccomponentsorganismsheadertsx)
        - [4.5.2 ContactForm (`src/components/organisms/ContactForm.tsx`)](#452-contactform-srccomponentsorganismscontactformtsx)
- [5. 統合テスト仕様](#5-統合テスト仕様)
    - [5.1 APIルート](#51-apiルート)
        - [5.1.1 GET /api/portfolio (`src/app/api/portfolio/route.ts`)](#511-get-apiportfolio-srcappapiportfolioroutets)
        - [5.1.2 POST /api/contact (`src/app/api/contact/route.ts`)](#512-post-apicontact-srcappapicontactroutets)
    - [5.2 データフェッチフロー](#52-データフェッチフロー)
        - [5.2.1 data-server (`src/lib/data-server.ts`)](#521-data-server-srclibdata-serverts)
        - [5.2.2 GCSクライアント (`src/lib/gcs.ts`)](#522-gcsクライアント-srclibgcsts)
        - [5.2.3 Resendクライアント (`src/lib/resend.ts`)](#523-resendクライアント-srclibresendts)
- [6. E2Eテスト仕様](#6-e2eテスト仕様)
    - [6.1 ホームページ表示テスト](#61-ホームページ表示テスト)
    - [6.2 ナビゲーションテスト](#62-ナビゲーションテスト)
    - [6.3 スキルセクションテスト](#63-スキルセクションテスト)
    - [6.4 お問い合わせフォームテスト](#64-お問い合わせフォームテスト)
    - [6.5 レスポンシブデザインテスト](#65-レスポンシブデザインテスト)
    - [6.6 アクセシビリティテスト](#66-アクセシビリティテスト)
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
| 対象技術スタック | Next.js 14.2.5 / TypeScript 5.5.2 / React 18.3.1 |

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

```
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

```
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
│   │   ├── SkillCard.tsx
│   │   ├── SkillCard.test.tsx
│   │   ├── CareerCard.tsx
│   │   ├── CareerCard.test.tsx
│   │   ├── SocialLinks.tsx
│   │   └── SocialLinks.test.tsx
│   └── organisms/
│       ├── Header.tsx
│       ├── Header.test.tsx
│       ├── ContactForm.tsx
│       └── ContactForm.test.tsx
├── lib/
│   ├── costom-date.ts
│   ├── costom-date.test.ts
│   ├── data-server.ts
│   └── data-server.test.ts
├── utils/
│   ├── validation.ts
│   ├── validation.test.ts
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

#### 4.1.2 toDateString関数 (`src/lib/costom-date.ts`)

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

> 注: `formatCareerPeriod` は `page.tsx` のモジュールスコープに定義されたプライベート関数であるため、テスト容易性のために `src/lib/costom-date.ts` または `src/utils/` 配下に抽出することを推奨する。

### 4.2 バリデーションロジック

#### 4.2.1 ContactFormSchema (`src/utils/validation.ts`)

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

#### 4.4.1 SkillCard (`src/components/molecules/SkillCard.tsx`)

| テストID | テストケース | 検証内容 |
|----------|------------|---------|
| UT-SKC-001 | スキル名が表示される | h3要素にスキル名が反映される |
| UT-SKC-002 | 説明文が表示される | p要素に説明文が反映される |
| UT-SKC-003 | アイコン画像が表示される | Image要素にiconUrlがsrcとして設定される |
| UT-SKC-004 | アイコンのalt属性が適切に設定される | `${name} icon` 形式のalt属性が設定される |
| UT-SKC-005 | className が追加適用される | カスタムクラスがマージされる |
| UT-SKC-006 | style プロパティが適用される | インラインスタイルが要素に反映される |
| UT-SKC-007 | glass-card クラスが適用される | ベーススタイルとしてglass-cardが存在する |

#### 4.4.2 CareerCard (`src/components/molecules/CareerCard.tsx`)

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

#### 4.4.3 SocialLinks (`src/components/molecules/SocialLinks.tsx`)

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

## 5. 統合テスト仕様

### 5.1 APIルート

#### 5.1.1 GET /api/portfolio (`src/app/api/portfolio/route.ts`)

| テストID | テストケース | 前提条件 | 期待結果 |
|----------|------------|---------|---------|
| IT-API-PF-001 | ポートフォリオデータを正常取得する | GCS接続成功（モック） | 200 OK + JSONデータ |
| IT-API-PF-002 | Cache-Control ヘッダーが設定される | 正常レスポンス | `public, s-maxage=300, stale-while-revalidate=86400` |
| IT-API-PF-003 | GCS接続エラー時に500エラーを返す | GCS接続失敗（モック） | 500 + エラーJSONオブジェクト |
| IT-API-PF-004 | エラーレスポンスに詳細情報が含まれる | GCS接続失敗（モック） | error, details, timestamp フィールドが存在する |
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

### 5.2 データフェッチフロー

#### 5.2.1 data-server (`src/lib/data-server.ts`)

| テストID | テストケース | 前提条件 | 期待結果 |
|----------|------------|---------|---------|
| IT-DS-001 | 開発環境でローカルデータを返す | NODE_ENV='development', sample.json存在 | ローカルデータが返却される |
| IT-DS-002 | 本番環境でGCSデータを返す | NODE_ENV='production', GCS接続成功 | GCSデータが返却される |
| IT-DS-003 | FORCE_GCS設定時にGCSから取得する | NODE_ENV='development', FORCE_GCS=true | GCSデータが返却される |
| IT-DS-004 | GCS失敗時にローカルデータにフォールバックする | NODE_ENV='development', GCS失敗, sample.json存在 | ローカルデータが返却される |
| IT-DS-005 | 本番環境でGCS失敗時にエラーを投げる | NODE_ENV='production', GCS失敗 | Error がスローされる |

#### 5.2.2 GCSクライアント (`src/lib/gcs.ts`)

| テストID | テストケース | 前提条件 | 期待結果 |
|----------|------------|---------|---------|
| IT-GCS-001 | GCSからJSONデータを取得する | ファイル存在（モック） | パースされたJSONオブジェクトが返却される |
| IT-GCS-002 | ファイル未存在時にエラーを投げる | ファイル未存在（モック） | `Error: File ${jsonPath} not found` |
| IT-GCS-003 | バケット未存在時にエラーを投げる | バケット未存在（モック） | Error がスローされる |
| IT-GCS-004 | 不正なJSON時にエラーを投げる | ファイル内容が不正JSON（モック） | Error がスローされる |
| IT-GCS-005 | testGCSConnection が接続成功を返す | バケット存在（モック） | true |
| IT-GCS-006 | testGCSConnection が接続失敗を返す | バケット未存在（モック） | false |

#### 5.2.3 Resendクライアント (`src/lib/resend.ts`)

| テストID | テストケース | 前提条件 | 期待結果 |
|----------|------------|---------|---------|
| IT-RS-001 | メールを正常に送信する | Resend API正常（モック） | `{ success: true, messageId: '...' }` |
| IT-RS-002 | RESEND_API_KEY未設定時にエラーを返す | RESEND_API_KEY=undefined | `{ success: false, error: 'RESEND_API_KEY is not configured' }` |
| IT-RS-003 | MY_MAIL_ADDRESS未設定時にエラーを返す | MY_MAIL_ADDRESS=undefined | `{ success: false, error: 'MY_MAIL_ADDRESS is not configured' }` |
| IT-RS-004 | RESEND_FROM_EMAIL未設定時にエラーを返す | RESEND_FROM_EMAIL=undefined | `{ success: false, error: 'RESEND_FROM_EMAIL is not configured' }` |
| IT-RS-005 | Resend API失敗時にエラーを返す | Resend API失敗（モック） | `{ success: false, error: '...' }` |
| IT-RS-006 | メール件名が正しいフォーマットになる | 正常送信 | `'ポートフォリオサイトからのお問い合わせ - ${name}様'` |
| IT-RS-007 | replyToに送信者メールが設定される | 正常送信 | replyTo に data.email が設定される |
| IT-RS-008 | testResendConnection がAPIキー形式を検証する | RESEND_API_KEY='re_xxx' | true |
| IT-RS-009 | testResendConnection が不正形式で失敗を返す | RESEND_API_KEY='invalid' | false |

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
| E2E-HOME-006 | Skillsセクションが表示される | #skills にスクロール | Skills見出しとスキルカードが表示される |
| E2E-HOME-007 | Contactセクションが表示される | #contact にスクロール | Contact見出しとフォームが表示される |
| E2E-HOME-008 | フッターが表示される | ページ最下部にスクロール | コピーライト文が表示される |

### 6.2 ナビゲーションテスト

| テストID | テストケース | 操作手順 | 期待結果 |
|----------|------------|---------|---------|
| E2E-NAV-001 | ヘッダーナビゲーションでAboutに移動する | 「About」ボタンをクリック | #about セクションまでスムーズスクロールする |
| E2E-NAV-002 | ヘッダーナビゲーションでCareerに移動する | 「Career」ボタンをクリック | #career セクションまでスムーズスクロールする |
| E2E-NAV-003 | ヘッダーナビゲーションでSkillsに移動する | 「Skills」ボタンをクリック | #skills セクションまでスムーズスクロールする |
| E2E-NAV-004 | ヘッダーナビゲーションでContactに移動する | 「Contact」ボタンをクリック | #contact セクションまでスムーズスクロールする |
| E2E-NAV-005 | Heroの「お問い合わせ」ボタンでContactに移動する | 「お問い合わせ」ボタンをクリック | #contact セクションまでスムーズスクロールする |
| E2E-NAV-006 | スクロール時にヘッダーが半透明になる | 下方にスクロール | ヘッダーにglass-effectが適用される |
| E2E-NAV-007 | モバイルメニューが開閉する | ハンバーガーメニューをクリック | モバイルナビゲーションの表示/非表示が切り替わる |
| E2E-NAV-008 | モバイルメニュー項目クリックでメニューが閉じる | モバイルメニュー項目をクリック | メニューが閉じてセクションにスクロールする |

### 6.3 スキルセクションテスト

| テストID | テストケース | 操作手順 | 期待結果 |
|----------|------------|---------|---------|
| E2E-SKL-001 | 初期表示で9件のスキルカードが表示される | Skillsセクションを確認 | 最大9件のスキルカードが表示される |
| E2E-SKL-002 | 「and more...」ボタンで追加スキルが表示される | 「and more...」ボタンをクリック | さらに6件のスキルカードが表示される |
| E2E-SKL-003 | 追加表示時にフェードインアニメーションが適用される | 「and more...」ボタンをクリック | 新しいカードにanimate-fade-in-upクラスが付与される |
| E2E-SKL-004 | 全スキル表示後にボタンが消えメッセージが表示される | 全スキルが表示されるまでクリック | 「and more...」ボタンが消え、skills_moreテキストが表示される |

### 6.4 お問い合わせフォームテスト

| テストID | テストケース | 操作手順 | 期待結果 |
|----------|------------|---------|---------|
| E2E-CF-001 | 空フォーム送信でバリデーションエラーが表示される | 空のまま送信ボタンをクリック | 各フィールドのエラーメッセージが表示される |
| E2E-CF-002 | 正常な値で送信が成功する | 正常値を入力して送信 | 「送信完了」メッセージが表示される |
| E2E-CF-003 | 送信中にローディング表示になる | フォーム送信 | 「送信中...」テキストとスピナーが表示される |
| E2E-CF-004 | 送信完了後に「新しいお問い合わせ」ボタンが表示される | フォーム送信成功後 | 「新しいお問い合わせ」ボタンが表示される |
| E2E-CF-005 | 「新しいお問い合わせ」クリックでフォームに戻る | 「新しいお問い合わせ」ボタンをクリック | フォームが再表示され、入力フィールドが空になる |
| E2E-CF-006 | API接続エラー時にエラーメッセージが表示される | ネットワークエラーをシミュレート | エラーメッセージが表示される |

### 6.5 レスポンシブデザインテスト

| テストID | テストケース | ビューポート | 期待結果 |
|----------|------------|------------|---------|
| E2E-RES-001 | モバイル表示でレイアウトが崩れない | 375 x 667 (iPhone SE) | 全セクションが正常表示される |
| E2E-RES-002 | タブレット表示でレイアウトが崩れない | 768 x 1024 (iPad) | 全セクションが正常表示される |
| E2E-RES-003 | デスクトップ表示でレイアウトが崩れない | 1920 x 1080 | 全セクションが正常表示される |
| E2E-RES-004 | モバイルでハンバーガーメニューが表示される | 375 x 667 | ハンバーガーアイコンが表示される |
| E2E-RES-005 | デスクトップでナビゲーションバーが表示される | 1920 x 1080 | 横並びのナビゲーション項目が表示される |
| E2E-RES-006 | スキルカードのグリッドが画面幅に応じて変化する | 各ビューポート | モバイル: 1列、md: 2列、lg: 3列、xl: 4列 |

### 6.6 アクセシビリティテスト

| テストID | テストケース | 検証内容 |
|----------|------------|---------|
| E2E-A11Y-001 | 画像にalt属性が設定されている | 全Image要素にalt属性が存在する |
| E2E-A11Y-002 | フォーム要素にlabelが関連付けられている | label要素とinput/textarea要素が対応している |
| E2E-A11Y-003 | インタラクティブ要素にキーボードアクセス可能 | Tabキーで全ボタン・リンクにフォーカスが移動する |
| E2E-A11Y-004 | html要素にlang='ja'が設定されている | ドキュメントの言語属性が正しい |
| E2E-A11Y-005 | コントラスト比が十分である | 主要テキストのコントラスト比がWCAG AA基準を満たす |
| E2E-A11Y-006 | SNSリンクにaria-labelが設定されている | 各SNSリンクに適切なaria-labelが存在する |

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

```
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
| navbar_data | NavbarData | link_title, about_name, career_name, skills_name, contact_name が非空文字列 |
| hero_data | HeroData | hero_img_url が有効なURL形式 |
| about_data | AboutData | about_name, about_img_url が非空、sns_list が1件以上、about_contents が1件以上 |
| career_title_data | CareerTitleData | 全フィールドが非空文字列 |
| career_data | CareerData[] | 1件以上のキャリアデータ（career_end='now' のケースを含む） |
| skills_data | SkillsData | skills_cards が10件以上（ページネーションテスト用）、skills_more が非空文字列 |
| contact_data | ContactData | 全フィールドが非空文字列 |
| footer_data | FooterData | copyright が非空文字列 |

---

## 9. CI/CD テスト統合

### 9.1 GitHub Actions ワークフロー

テストを CI パイプラインに統合するための推奨ワークフロー構成を以下に示す。

```
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

4. APIルートの統合テスト（portfolio, contact）
5. Moleculesコンポーネントのユニットテスト（SkillCard, CareerCard, SocialLinks）
6. データフェッチフローの統合テスト（data-server, gcs, resend）

### フェーズ3: 画面テスト（優先度: 中）

7. Organismsコンポーネントのユニットテスト（Header, ContactForm）
8. ページコンポーネントの統合テスト（page.tsx）

### フェーズ4: E2E・品質テスト（優先度: 中）

9. Playwright セットアップと主要シナリオのE2Eテスト
10. レスポンシブデザインテスト
11. アクセシビリティテスト

### フェーズ5: CI/CD統合（優先度: 低）

12. GitHub Actions ワークフロー構築
13. カバレッジレポートの自動生成
14. パフォーマンステストの自動化
