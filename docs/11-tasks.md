# タスク管理 - TechProfile Pro

| 項目 | 内容 |
|------|------|
| プロジェクト名 | TechProfile Pro |
| バージョン | 1.0.0 |
| 作成日 | 2026-03-20 |
| ステータス | 運用中（Phase 1 完了） |

---

## 目次

- [1. タスク一覧](#1-タスク一覧)
    - [1.1 コア機能実装（Phase 1）](#11-コア機能実装phase-1)
    - [1.2 バグ修正](#12-バグ修正)
    - [1.3 インフラ・CI/CD](#13-インフラcicd)
- [2. 未着手・今後のタスク](#2-未着手今後のタスク)
    - [2.1 テスト導入](#21-テスト導入)
    - [2.2 パフォーマンス最適化](#22-パフォーマンス最適化)
    - [2.3 機能拡張](#23-機能拡張)
    - [2.4 セキュリティ・品質改善](#24-セキュリティ品質改善)
- [3. マイルストーン](#3-マイルストーン)
    - [Phase 1: MVP リリース（完了）](#phase-1-mvp-リリース完了)
    - [Phase 2: 品質強化（次期）](#phase-2-品質強化次期)
    - [Phase 3: 機能拡張（将来）](#phase-3-機能拡張将来)
    - [Phase 4: 拡張・国際化（将来）](#phase-4-拡張国際化将来)
- [4. タスク統計サマリ](#4-タスク統計サマリ)
- [5. 更新履歴](#5-更新履歴)

---

## 1. タスク一覧

### 1.1 コア機能実装（Phase 1）

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 1 | プロジェクト初期セットアップ（Next.js 14 + TypeScript + Tailwind CSS） | 完了 | 最高 | App Router、TypeScript strict モード有効 |
| 2 | Atomic Design コンポーネント設計・実装 | 完了 | 最高 | atoms: Button, Input, TextArea, Badge / molecules: SkillCard, CareerCard, SocialLinks / organisms: Header, ContactForm |
| 3 | Hero セクション実装 | 完了 | 高 | キャッチコピー、CTA、背景画像、ネオンエフェクト、フロートアニメーション |
| 4 | About セクション実装 | 完了 | 高 | プロフィール画像、自己紹介テキスト、SNSリンク（X, GitHub, Zenn, Qiita） |
| 5 | Career セクション実装 | 完了 | 高 | タイムライン表示、プロジェクト経歴カード、期間・チーム規模・技術スタック・フェーズ・役割表示 |
| 6 | Skills セクション実装 | 完了 | 高 | グリッド表示、初期9件表示、6件ずつ追加読み込み、フェードインアニメーション |
| 7 | Contact セクション実装 | 完了 | 高 | React Hook Form + Zod バリデーション、Resend メール送信、送信完了画面 |
| 8 | Footer セクション実装 | 完了 | 中 | コピーライト表示 |
| 9 | ナビゲーション（Header）実装 | 完了 | 高 | 固定ヘッダー、スクロール時のグラスエフェクト、スムーズスクロール |
| 10 | モバイルハンバーガーメニュー実装 | 完了 | 高 | レスポンシブ対応、`md:` ブレークポイントで切替 |
| 11 | レスポンシブデザイン対応 | 完了 | 高 | モバイル / タブレット / デスクトップの3段階対応 |
| 12 | GCS データソース連携 | 完了 | 最高 | プライベートバケットからの JSON 取得、ADC / サービスアカウント認証対応 |
| 13 | ローカル開発フォールバック（sample.json） | 完了 | 中 | `data-server.ts` にロジック実装済み。`sample.json` は `.gitignore` 済みだが、デモデータ `sample.example.json` を同梱。`cp sample.example.json sample.json` で GCS なしで起動可能 |
| 14 | API Route 実装（/api/portfolio） | 完了 | 最高 | ポートフォリオデータ取得、Cache-Control ヘッダー設定 |
| 15 | API Route 実装（/api/contact） | 完了 | 最高 | お問い合わせ送信、サーバーサイドバリデーション、Resend 連携 |
| 16 | SEO メタデータ設定 | 完了 | 中 | title, description, keywords, OGP, Twitter Card, robots |
| 17 | Glassmorphism / Neon エフェクト CSS 実装 | 完了 | 中 | glass-effect, glass-card, neon-text, shadow-neon 等のカスタムクラス |
| 18 | カスタムアニメーション定義 | 完了 | 中 | fade-in-up, fade-in-down, slide-in, float, glow 等（tailwind.config.js） |
| 19 | TypeScript 型定義（PortfolioData） | 完了 | 高 | 全セクション対応の包括的な型定義 |
| 20 | Zod バリデーションスキーマ定義 | 完了 | 高 | 名前（2-50文字）、メール（255文字以内）、メッセージ（10-2000文字） |

### 1.2 バグ修正

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 21 | Skills セクション「and more...」アニメーション遅延バグ修正 | 完了 | 高 | PR #12。累積的な animationDelay が増加し続ける問題を修正。`prevVisibleCountRef` を導入し、新規追加分のみにアニメーション適用 |
| 22 | 日付表示バグ修正 | 完了 | 高 | Career セクションの期間表示に関する不具合修正。`costom-date.ts` の `toDateString()` 関数追加 |
| 23 | GitHub Actions デプロイバグ修正（複数回） | 完了 | 高 | PR #2 - #6。CI/CD パイプラインの設定修正を複数回実施 |
| 50 | お問い合わせ送信の Resend API エラーが成功扱いになる不具合修正 | 完了 | 高 | `resend.ts` が `emails.send()` の `result.error` を検査しておらず、Resend が HTTP エラー（非2xx）を返しても `success: true` を返していた。統合テストで検出し、`result.error` 検知時に `success: false` を返すよう修正（`/api/contact` が仕様どおり 500 を返すようになった） |

### 1.3 インフラ・CI/CD

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 24 | GitHub Actions ワークフロー構築 | 完了 | 高 | Cloud Run への自動デプロイ、Docker ビルド・プッシュ |
| 25 | 古い Docker イメージのクリーンアップ自動化 | 完了 | 中 | 最新5件を保持し、古いイメージを自動削除 |
| 26 | Cloud Run デプロイ設定 | 完了 | 高 | GitHub Actions + Docker による Cloud Run 自動デプロイ |
| 27 | LICENSE ファイル追加 | 完了 | 低 | PR #13 |

---

## 2. 未着手・今後のタスク

### 2.1 テスト導入

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 28 | テストフレームワーク導入（Vitest + Testing Library / Playwright） | 完了（Vitest） | 高 | Vitest 4 + Testing Library + jsdom を導入。`vitest.config.ts` / `src/__tests__/setup.ts` / `test`・`test:run`・`test:coverage` スクリプト整備。CI（`ci.yml`）で `pnpm test:run` を実行。Playwright（E2E）は #32 で未導入 |
| 29 | ユニットテスト実装（ユーティリティ関数） | 完了 | 高 | `cn()`（`src/utils/cn.test.ts`）/ `toDateString()`（`src/lib/costom-date.test.ts`）/ `ContactFormSchema`（`src/utils/validation.test.ts`）を実装。計 30 ケース（正常・準正常・異常、境界値含む）が PASS |
| 30 | コンポーネントテスト実装 | 未着手 | 中 | atoms / molecules / organisms の描画テスト・インタラクションテスト。`@vitejs/plugin-react` が TS 5.5.2 と非互換のため、JSX 変換設定の整備が前提 |
| 31 | API Route / データフェッチ統合テスト実装 | 完了 | 中 | 統合テスト（`*.integration.test.ts`）を実装。GCS は `fsouza/fake-gcs-server` コンテナ（Testcontainers）で実データ経路を検証、Resend は MSW で HTTP モック。`GET /api/portfolio`（`route.integration.test.ts`）/ `POST /api/contact`（同）/ `gcs`（`gcs.integration.test.ts`）を対象、計 10 ケース（正常・準正常・異常）。`vitest.integration.config.ts` + `pnpm test:it`、CI（`ci.yml`）で実行 |
| 32 | E2E テスト導入（Playwright） | 完了 | 低 | Playwright を導入し `e2e/` にシナリオテストを実装（`home` / `contact` / `error`、計 7 ケース、正常/準正常/異常）。ポートフォリオ表示は fake-gcs-server コンテナの実データ（`next start` を `GCS_API_ENDPOINT` で向ける）、送信・失敗系は `page.route` でスタブ。`playwright.config.ts` に retries/trace（flaky 対応）。専用ワークフロー `.github/workflows/e2e.yml`（PR）で実行 |
| 51 | `/api/portfolio` がビルド時プリレンダーされ実行時に GCS を参照しない不具合修正 | 完了 | 中 | Route Handler に動的 API が無く静的プリレンダーされていたため、データがビルド時点で固定され（かつビルドに GCS 認証が必要）、実行時の GCS 取得・キャッシュ（docs/07 §5）が機能していなかった。E2E 導入時に検出し `export const dynamic = 'force-dynamic'` を追加。実行時に GCS を取得し、キャッシュは CDN 側の `Cache-Control` に委ねる |

### 2.2 パフォーマンス最適化

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 33 | `next/font` によるフォント最適化 | 未着手 | 中 | 現在 CSS `@import` で Google Fonts を読み込み。`next/font/google` に移行することでプリロード・FOUT 抑制が可能 |
| 34 | 画像最適化の検討 | 検討中 | 中 | `images.unoptimized: true` の見直し。`remotePatterns` 設定による外部画像の最適化対応 |
| 35 | ISR（Incremental Static Regeneration）導入検討 | 検討中 | 低 | 現在のクライアントフェッチ方式から SSG + ISR への移行。要件定義で言及あり |
| 36 | スケルトンスクリーン実装 | 未着手 | 中 | 現在のスピナー表示をスケルトンUIに置き換え、体感ロード速度を改善 |
| 37 | バンドルサイズ分析・最適化 | 未着手 | 低 | `@next/bundle-analyzer` 導入による依存パッケージのサイズ確認 |

### 2.3 機能拡張

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 38 | ポートフォリオデータ更新機能（CMS/管理画面） | 検討中 | 中 | README で将来的な拡張として言及。GCSへの直接アップロードの代替手段 |
| 39 | Google Analytics 導入 | 未着手 | 中 | 要件定義で言及あり。アクセス解析・ユーザー行動の可視化 |
| 40 | i18n（国際化）対応 | 未着手 | 低 | 現在は日本語のみ。英語対応を検討（`next-intl` 等） |
| 41 | OGP 画像の設定 | 未着手 | 中 | SNSシェア時のプレビュー画像。`og:image` メタタグの設定 |
| 42 | お問い合わせ自動返信メール | 未着手 | 低 | 送信者への確認メール自動送信 |
| 43 | ライトモード / テーマ切替 | 未着手 | 低 | 現在ダークテーマ固定。`next-themes` 等の導入検討 |

### 2.4 セキュリティ・品質改善

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 44 | React Error Boundary 実装 | 未着手 | 高 | コンポーネントエラー時のフォールバックUI表示 |
| 45 | お問い合わせフォームのレート制限実装 | 未着手 | 高 | スパム対策。IP ベースまたはトークンベースのレート制限 |
| 46 | CSRF トークン検証の導入 | 検討中 | 中 | API Route へのCSRF保護追加 |
| 47 | `costom-date.ts` のファイル名修正 | 未着手 | 低 | タイプミス修正（`costom` -> `custom`）。インポートパスの更新が必要 |
| 48 | ローディング/エラー状態のアクセシビリティ改善 | 未着手 | 中 | `aria-live`, `role="alert"` 等の追加 |
| 49 | サーバーサイドバリデーション強化（Zod統一） | 未着手 | 中 | API Route のバリデーションをクライアント側と同じ Zod スキーマで統一 |

### 2.5 テスト・CI/CD 拡充（残タスク）

テスト基盤（UT/IT/E2E）導入時に洗い出した follow-up。

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 30 | コンポーネントテスト実装 | 未着手 | 中 | （再掲）atoms / molecules / organisms の描画・インタラクションテスト。`@vitejs/plugin-react` が TS 5.5.2 と非互換のため、TS 5.5 互換の JSX 変換設定の整備 or TypeScript 更新が前提 |
| 52 | テストカバレッジ閾値の有効化 | 未着手 | 中 | 現状 `vitest.config.ts` の coverage 閾値は未設定（docs/08 目標: statements 80% 等）。テスト拡充に合わせ `test:coverage` の閾値を有効化し、CI に組み込むか判断する |
| 53 | 実行環境の Node バージョン整合 | 未着手 | 中 | CI は Node 24（testcontainers → undici@8 が Node>=22.19 を要求）、本番 Dockerfile は `node:18-alpine`。ランタイムと CI のバージョン差を解消するか（Dockerfile を 20/22 系へ更新）、現状維持とするか方針を決める |
| 47 | `costom-date.ts` のファイル名修正 | 未着手 | 低 | （再掲・§2.4）タイプミス修正（`costom` -> `custom`）。インポートパス（`page.tsx` / IT）の更新が必要 |

---

## 3. マイルストーン

### Phase 1: MVP リリース（完了）

**期間**: 初期開発 ~ 2026年3月
**目標**: ポートフォリオサイトの基本機能を実装し、公開可能な状態にする

| 目標 | ステータス |
|------|-----------|
| 全セクション実装（Hero, About, Career, Skills, Contact, Footer） | 完了 |
| レスポンシブデザイン対応 | 完了 |
| GCS データソース連携 | 完了 |
| Resend メール送信連携 | 完了 |
| SEO メタデータ設定 | 完了 |
| CI/CD パイプライン構築（GitHub Actions -> Cloud Run） | 完了 |
| Cloud Run デプロイ | 完了 |
| 主要バグ修正（Skills アニメーション、日付表示、CI/CD） | 完了 |

### Phase 2: 品質強化（次期）

**期間**: 2026年4月 ~ 2026年5月（予定）
**目標**: テスト導入、セキュリティ強化、パフォーマンス改善

| 目標 | ステータス | 該当タスク |
|------|-----------|-----------|
| テストフレームワーク導入・基本テスト実装 | 未着手 | #28 - #31 |
| Error Boundary 実装 | 未着手 | #44 |
| レート制限実装 | 未着手 | #45 |
| `next/font` フォント最適化 | 未着手 | #33 |
| スケルトンスクリーン実装 | 未着手 | #36 |
| アクセシビリティ改善 | 未着手 | #48 |

### Phase 3: 機能拡張（将来）

**期間**: 2026年6月 ~ 2026年8月（予定）
**目標**: ユーザー体験の向上と運用機能の追加

| 目標 | ステータス | 該当タスク |
|------|-----------|-----------|
| Google Analytics 導入 | 未着手 | #39 |
| OGP 画像設定 | 未着手 | #41 |
| 画像最適化 | 検討中 | #34 |
| サーバーサイドバリデーション統一 | 未着手 | #49 |
| お問い合わせ自動返信メール | 未着手 | #42 |

### Phase 4: 拡張・国際化（将来）

**期間**: 2026年9月以降（予定）
**目標**: 大規模な機能拡張と国際化対応

| 目標 | ステータス | 該当タスク |
|------|-----------|-----------|
| データ更新機能（CMS/管理画面） | 検討中 | #38 |
| i18n 対応（英語） | 未着手 | #40 |
| E2E テスト導入 | 未着手 | #32 |
| ISR 導入検討 | 検討中 | #35 |
| ライトモード / テーマ切替 | 未着手 | #43 |

---

## 4. タスク統計サマリ

| ステータス | 件数 |
|-----------|------|
| 完了 | 33 |
| 未着手 | 16 |
| 検討中 | 4 |
| **合計** | **53** |

| 優先度 | 件数 |
|--------|------|
| 最高 | 4 |
| 高 | 20 |
| 中 | 21 |
| 低 | 8 |

> 直近の完了: #28/#29（Vitest + UT）、#31（IT: Testcontainers + MSW）、#32（E2E: Playwright）、#50（Resend エラー握り潰し修正）、#51（`/api/portfolio` を force-dynamic 化）。新規未着手: #52（カバレッジ閾値）、#53（Node バージョン整合）。

---

## 5. 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2026-07-08 | テスト基盤導入（UT/IT/E2E）と CI 整備、JSDoc lint・ルール拡充を完了（PR #21〜#25）。残タスク（#30/#52/#53）を追記 | - |
| 2026-03-20 | タスク管理ドキュメント初版作成 | - |
| 2026-03-15 | Skills アニメーション遅延バグ修正完了（PR #12） | - |
| 2026-03-15 | LICENSE 追加（PR #13） | - |
| 2026-01-22 | 日付表示バグ修正、要件定義書修正 | - |
| 2025-06-21 | GitHub Actions CI/CD パイプライン修正完了（PR #2 - #6） | - |
