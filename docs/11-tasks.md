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
    - [2.5 テスト・CI/CD 拡充（残タスク）](#25-テストcicd-拡充残タスク)
    - [2.6 デザイン刷新（issue #135）](#26-デザイン刷新issue-135)
    - [2.7 掲載セクションの再構成（issue #125）](#27-掲載セクションの再構成issue-125)
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
| 3 | Hero セクション実装 | 完了 | 高 | キャッチコピー、CTA、背景画像、ネオンエフェクト、フロートアニメーション。**※ issue #138 で再構成。CTA・背景画像・装飾エフェクトを廃し、キャッチコピー + 引用パネル + 実績バンド（件数 / 技術数 / 経歴開始年）の構成へ** |
| 4 | About セクション実装 | 完了 | 高 | プロフィール画像、自己紹介テキスト、SNSリンク（X, GitHub, Zenn, Qiita） |
| 5 | Career セクション実装 | 完了 | 高 | タイムライン表示、プロジェクト経歴カード、期間・チーム規模・技術スタック・フェーズ・役割表示。**※ issue #138 で再構成。タイムラインの縦線・ドットを廃し、カード左罫の色（進行中 / 過去）と技術スタックの分類チップへ置き換え** |
| 6 | Skills セクション実装 | 完了 | 高 | グリッド表示、初期9件表示、6件ずつ追加読み込み、フェードインアニメーション。**※ 掲載内容の見直しによりセクションごと削除した（issue #126 / タスク #68）** |
| 7 | Contact セクション実装 | 完了 | 高 | React Hook Form + Zod バリデーション、Resend メール送信、送信完了画面 |
| 8 | Footer セクション実装 | 完了 | 中 | コピーライト表示 |
| 9 | ナビゲーション（Header）実装 | 完了 | 高 | 固定ヘッダー、スクロール時のグラスエフェクト、スムーズスクロール。**※ issue #138 で追従・グラスエフェクトを廃止（本文に被る要素が書類の読みを妨げるため）。スムーズスクロールは維持し、テーマトグルを追加** |
| 10 | モバイルハンバーガーメニュー実装 | 完了 | 高 | レスポンシブ対応、`md:` ブレークポイントで切替 |
| 11 | レスポンシブデザイン対応 | 完了 | 高 | モバイル / タブレット / デスクトップの3段階対応 |
| 12 | GCS データソース連携 | 完了 | 最高 | プライベートバケットからの JSON 取得、ADC / サービスアカウント認証対応 |
| 13 | ローカル開発フォールバック（sample.json） | 完了 | 中 | `repositories/portfolio.ts` にロジック実装済み。`sample.json` は `.gitignore` 済みだが、デモデータ `sample.example.json` を同梱。`cp sample.example.json sample.json` で GCS なしで起動可能 |
| 14 | API Route 実装（/api/portfolio） | 完了 | 最高 | ポートフォリオデータ取得、Cache-Control ヘッダー設定 |
| 15 | API Route 実装（/api/contact） | 完了 | 最高 | お問い合わせ送信、サーバーサイドバリデーション、Resend 連携 |
| 16 | SEO メタデータ設定 | 完了 | 中 | title, description, keywords, OGP, Twitter Card, robots |
| 17 | Glassmorphism / Neon エフェクト CSS 実装 | 完了 | 中 | glass-effect, glass-card, neon-text, shadow-neon 等のカスタムクラス。**※ issue #138 で全廃。配色は CSS カスタムプロパティ（デザイントークン）へ置き換え（タスク #71）** |
| 18 | カスタムアニメーション定義 | 完了 | 中 | fade-in-up, fade-in-down, slide-in, float, glow 等（tailwind.config.js）。**※ issue #138 で `fade-in-up`（Hero 初回表示の 1 回）を残して全廃。`prefers-reduced-motion: reduce` での無効化を `globals.css` に追加** |
| 19 | TypeScript 型定義（PortfolioData） | 完了 | 高 | 全セクション対応の包括的な型定義 |
| 20 | Zod バリデーションスキーマ定義 | 完了 | 高 | 名前（2-50文字）、メール（255文字以内）、メッセージ（10-2000文字） |

### 1.2 バグ修正

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 21 | Skills セクション「and more...」アニメーション遅延バグ修正 | 完了 | 高 | PR #12。累積的な animationDelay が増加し続ける問題を修正。`prevVisibleCountRef` を導入し、新規追加分のみにアニメーション適用。**※ 対象コードは issue #126 で削除済み** |
| 22 | 日付表示バグ修正 | 完了 | 高 | Career セクションの期間表示に関する不具合修正。`custom-date.ts` の `toDateString()` 関数追加 |
| 23 | GitHub Actions デプロイバグ修正（複数回） | 完了 | 高 | PR #2 - #6。CI/CD パイプラインの設定修正を複数回実施 |
| 50 | お問い合わせ送信の Resend API エラーが成功扱いになる不具合修正 | 完了 | 高 | `resend.ts` が `emails.send()` の `result.error` を検査しておらず、Resend が HTTP エラー（非2xx）を返しても `success: true` を返していた。統合テストで検出し、`result.error` 検知時に `success: false` を返すよう修正（`/api/contact` が仕様どおり 500 を返すようになった） |

### 1.3 インフラ・CI/CD

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 24 | GitHub Actions ワークフロー構築 | 完了 | 高 | Cloud Run への自動デプロイ、Docker ビルド・プッシュ |
| 25 | 古い Docker イメージのクリーンアップ自動化 | 完了 | 中 | 最新5件を保持し、古いイメージを自動削除 |
| 26 | Cloud Run デプロイ設定 | 完了 | 高 | GitHub Actions + Docker による Cloud Run 自動デプロイ |
| 27 | LICENSE ファイル追加 | 完了 | 低 | PR #13 |
| 54 | 独自ドメイン `introtechkkplus.com` への切り替え | 完了 | 高 | Cloudflare（DNS）× Cloud Run（オリジン）。apex / www を両方マッピングし canonical は apex。`metadataBase` / `sitemap.ts` / `robots.ts` / `SITE_URL` 環境変数を整備。旧ドメイン `introtechkk.com`（失効）のマッピングは削除。issue #62 |

---

## 2. 未着手・今後のタスク

### 2.1 テスト導入

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 28 | テストフレームワーク導入（Vitest + Testing Library / Playwright） | 完了（Vitest） | 高 | Vitest 4 + Testing Library + jsdom を導入。`vitest.config.ts` / `src/__tests__/setup.ts` / `test`・`test:run`・`test:coverage` スクリプト整備。CI（`ci.yml`）で `pnpm test:run` を実行。Playwright（E2E）は #32 で未導入 |
| 29 | ユニットテスト実装（ユーティリティ関数） | 完了 | 高 | `cn()`（`src/utils/cn.test.ts`）/ `toDateString()`（`src/lib/custom-date.test.ts`）/ `ContactFormSchema`（`src/schemas/contact.test.ts`）を実装。計 30 ケース（正常・準正常・異常、境界値含む）が PASS |
| 30 | コンポーネントテスト実装 | 完了 | 中 | issue #141（前半は #138）。**前提だった JSX 変換設定は issue #138 で解消**（Vite 8 は esbuild ではなく oxc を使うため、`@vitejs/plugin-react` も `esbuild.jsx` も効かない。`vitest.config.ts` に `oxc: { jsx: { runtime: 'automatic' } }` を設定し、プラグイン依存を削除）。全 9 コンポーネント + `useTheme` に計 68 ケース（正常系 10 : 準正常系+異常系 48）。検証はクラス名ではなく**振る舞いと契約**（ロール・アクセシブルネーム・`aria-*`・`disabled`）を対象にし、クラスは `variant` / `size` のようにクラスとしてしか観測できない props に限定。9 変異を注入して検出力を確認済み。**副産物として、`required` / `type="email"` のネイティブ検証が submit を止めるため Zod の `min(1)` / `.email()` メッセージがクライアントでは表示されないことを文書化した**（docs/03 §3.5 / docs/08 §4.7.9） |
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
| 43 | ライトモード / テーマ切替 | 完了 | 低 | issue #136 / #138 で対応。**`next-themes` は使わない**（テーマ復元のためのインラインスクリプトが nonce ベース CSP と相性が悪い）。Cookie をサーバー側（`layout.tsx`）で読んで `<html data-theme>` に反映する方式とし、JS を足さずに FOUC を回避した |

### 2.4 セキュリティ・品質改善

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 44 | React Error Boundary 実装 | 完了 | 高 | issue #76 の server-first 化で `src/app/error.tsx` として実装済み。`page.tsx`（Server Component）の例外を捕捉し、`reset()`（セグメント再レンダリング）と `location.reload()` の 2 段の復帰手段を出す。docs/10 §6.1 の既知課題からも除外 |
| 45 | お問い合わせフォームのレート制限実装 | 完了 | 高 | issue #60 で対応。クライアント IP 単位で 10分/5回。バリデーション前に判定し 429 + `Retry-After` を返す。プロセス内メモリのためインスタンスごとの制限になる限界は docs/06 §10.3 に明記 |
| 46 | CSRF トークン検証の導入 | 検討中 | 中 | API Route へのCSRF保護追加 |
| 47 | `costom-date.ts` のファイル名修正 | 完了 | 低 | issue #84 で対応。`git mv` で `src/lib/custom-date.ts` へリネームし、`client.tsx` とテストの import を更新。docs 6 ファイルの記述も追随 |
| 48 | ローディング/エラー状態のアクセシビリティ改善 | 完了 | 中 | `aria-live`, `role="alert"` 等の追加 |
| 49 | サーバーサイドバリデーション強化（Zod統一） | 完了 | 中 | API Route のバリデーションをクライアント側と同じ Zod スキーマで統一 |
| 70 | ESLint 9 + flat config への移行 | 完了 | 中 | issue #133。`eslint@9` / `typescript-eslint@8` へ更新し、`.eslintrc.json` を `eslint.config.mjs` へ移行。`next lint`（Next.js 16 で削除）から ESLint CLI へ切替。**`eslint-config-next` は 16 系を使うが Next.js 16 への移行ではない**（15.5.25 は同梱の `@next/eslint-plugin-next` が 14.2.5 と古く ESLint 9 で異常終了する。16.3.5 は `next` への peer 依存を持たない）。移行の成否は lint が通ることでは判定できないため、**違反を意図的に混入させて検出能力を 8 項目で実証**した |
| 69 | Node バージョンの統一 | 完了 | 中 | issue #130（タスク #53 と同一）。型定義が実行環境より新しいと「型は通るが本番に存在しない API」を書けてしまい、CI でも再現しないため本番でのみ落ちる。`package.json` の `engines.node` を正本とし、Dockerfile / CI / `@types/node` を 24 系へ統一。issue #88（Next.js 16）のブロッカー 1 件も解消 |
| 68 | Skills セクションの削除 | 完了 | 中 | issue #126（親 #125）。掲載内容の見直しに伴いコード・型・データをすべて削除。`SkillCard.tsx`、`client.tsx` の段階表示ロジック、`SkillsData` / `SkillCard` 型、`navbar_data.skills_name`、E2E 2 ケースが対象。**削除により `client.tsx` 自身は状態を持たなくなった**が、`Header` / `ContactForm` を配置するため `'use client'` は維持（判断を JSDoc に記録）。ドキュメントは 12 ファイル・56 箇所を更新し、`02-cn-utility.md` の `cn()` 解説の題材を `Button` へ差し替え |
| 67 | React 19 への移行 | 完了 | 中 | issue #104。`react` / `react-dom` / `@types/react` / `@types/react-dom` を 19.3.0 へ。`forwardRef` は**維持**（React 19 で ref は通常 props として渡せるが非推奨化はされておらず、書き換えると React 19 以降でしか動かなくなるため）。実ブラウザで react-hook-form の ref 透過・Zod 検証・`aria-invalid` 付与を検証し、非推奨警告 0 件を確認。`next@15.5.25` も `next@16.3.5` も React 18/19 の両方を許容するため、本移行は #88 の前提条件ではない |
| 66 | markdownlint の CI 導入 | 完了 | 低 | issue #79。既定ルールでは 3,126 件の違反が出るため、件数の 93% を占める MD060 / MD013 / MD007 と、意図的な記法である MD036 を無効化し、MD024 は `siblings_only` に設定。残り 190 件のうち 91 件を `--fix` で自動解消し、99 件を手動修正した。導入過程で docs/09 のコードフェンス破損（7 領域がコードブロックに飲み込まれていた）・目次のリンク切れ 12 件・runbook の番号誤りを検出。Prettier は `.prettierignore` で Markdown を対象外にしており競合しない |
| 65 | 鍵・`.env` の Git 混入を検出する Secret scan ジョブ | 完了 | 中 | issue #61。`.gitignore` は未追跡ファイルにしか効かず、Git 履歴は追記型のため、一度 push した秘匿ファイルは追跡除外しても残る（対処は鍵のローテーションのみ）。`.github/workflows/secret-scan.yml` で `git ls-files` をパスパターンと照合し、追跡された時点で CI を落とす。全履歴走査の結果、現時点の混入は 0 件。GitHub ネイティブの secret scanning / push protection は無効のままで、有効化は別途必要（docs/06 §11.3） |
| 64 | デッドコードと命名の不備の整理 | 完了 | 低 | issue #84。未参照の `testGCSConnection` / `testResendConnection` を削除（export されており lint の未使用検出をすり抜けていた）。特に後者は名前が「疎通確認」を期待させるのに実際は API キーの形式検証のみで、キーが失効していても `true` を返す誤誘導だった。あわせて docs/07 の接続テスト節と docs/08 の未実装 IT 仕様 4 件を削除し、docs/10 の既知課題表から解決済み 3 件を除外 |
| 63 | `lib/` 配下への定数・型の配置に関するルール解釈の確定 | 完了 | 低 | issue #115（#55 のセルフレビューで検出）。「`lib/` の下に型・定数を置かない」が、同じ節の「1 ファイルに閉じるなら定義ファイル内に置く」「最初から集約しない」と字面上衝突していた。**集約先としての禁止**（`lib/constants.ts` 等を作るな）と確定し、参照が閉じる非 export の定数・型は同居可と明文化。`coding-standards.md` と `frontend.md` の両方を同期。あわせて「公開関数のシグネチャに現れる型は export してよい」例外を追記（`RateLimitResult`）。コード変更なし |
| 62 | 問い合わせメール件名のヘッダーインジェクション対策 | 完了 | 中 | issue #114（#55 の派生）。件名は HTML でないため `escapeHtml` が使えず未対策のままだった。`src/lib/mail-header.ts` の `sanitizeHeaderValue()` で C0 制御文字と DEL を除去する。Resend は件名の制御文字の扱いを公開しておらず実地検証には実メール送信が必要なため、多層防御として実装（判断理由は docs/06 §8.3）。`replyTo` は `ContactFormSchema` の `.email()` が唯一の防御である点をテストで固定 |
| 61 | CORS・レートリミット・CSP の方針決定と実装 | 完了 | 中 | issue #60（親 #53）。CORS は**見送り**（同一オリジン専用 API にヘッダーを足すのは緩和にしかならないため、`.claude/rules/security.md` に適用範囲を追記）。`POST /api/contact` に 10分/5回 のレートリミット（`src/lib/rate-limit.ts` + `src/lib/client-ip.ts`）、`src/middleware.ts` に nonce + strict-dynamic の CSP、`next.config.js` に固定セキュリティヘッダー 5 種を追加。タスク #45（レート制限）も本対応で解消 |
| 60 | ログ方針の統一と統一エラーレスポンスの導入 | 完了 | 中 | issue #59（親 #53）。本番でログが出ない箇所（contact / resend）と、本番で `projectId` まで出す箇所（portfolio / gcs）が混在していた。`src/lib/logger.ts`（`logError` 常時 / `logWarn` 常時 / `logDebug` 開発時のみ）へ方針を集約し、全 `console.*` 直接呼び出しを置換。エラーレスポンスは `src/types/api-error.ts` の `ApiErrorResponse`（`{ error: string }`）へ統一し、`/api/portfolio` の `details` / `timestamp` を廃止 |
| 59 | 問い合わせメール HTML のユーザー入力をエスケープ（XSS 対策） | 完了 | 高 | issue #55（親 #53）。`resend.ts` がフォーム入力を未エスケープで HTML メールへ埋め込んでいた。`src/lib/html-escape.ts` の `escapeHtml()` を新設し html パートのみ適用（text / subject は HTML でないため対象外）。Zod の入力検証は出力エスケープの代わりにならない点を docs/06 §8.1 に明文化 |
| 58 | `next` を 15.5.25 へ更新（メジャー更新 フェーズ1） | 完了 | 高 | issue #86。`next` のアドバイザリが 0 件に（critical 2→0 / high 8→0）。Node / ESLint / React はいずれも据え置きで対応可能だった。`experimental.typedRoutes` → `typedRoutes` の移動が必要 |
| 57 | `next` を 14.2.35 へ更新 | 完了 | 高 | issue #81。`next@14.2.5` の既知脆弱性のうち 12 件（critical 1 / high 4 を含む）を解消。Cache Poisoning と Server Components DoS の一部が対象。15.x でのみ修正されるものは残存し、メジャー更新の判断は別途 |
| 56 | page.tsx の server-first 化 | 完了 | 高 | issue #76。初期 HTML の本文が 10 文字（`Loading...`）しか無く SEO 対策が空振りしていた問題を解消。`lib/` の外部 I/O を `repositories/` へ移設し、`page.tsx`（Server Component）/ `client.tsx` / `error.tsx` に分離 |
| 55 | JSDoc(TSDoc) 未付与の公開シンボル 45 件を解消 | 完了 | 中 | 親 issue #64。`jsdoc.md` は公開シンボルへの JSDoc を必須とするが、ブロックの有無を見る `require-jsdoc` が未採用のため lint をすり抜けていた。レイヤ別に 5 サブ issue へ分割（#65 types/utils・#66 lib/api・#67 components・#68 app ルート・#69 lint 強制）。型のフィールド説明は docs/05 を出典とする |

### 2.5 テスト・CI/CD 拡充（残タスク）

テスト基盤（UT/IT/E2E）導入時に洗い出した follow-up。

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 30 | コンポーネントテスト実装 | 未着手 | 中 | （再掲・§2.1）`SkillCard` は issue #126 で削除済みのため対象外 |
| 52 | テストカバレッジ閾値の有効化 | 未着手 | 中 | 現状 `vitest.config.ts` の coverage 閾値は未設定（docs/08 目標: statements 80% 等）。テスト拡充に合わせ `test:coverage` の閾値を有効化し、CI に組み込むか判断する |
| 53 | 実行環境の Node バージョン整合 | 完了 | 中 | issue #130 で対応。本番 v18 / CI 24 / 型定義 26 相当という 3 層の不整合を **Node 24 に統一**。`Dockerfile` を `node:24-alpine` へ、`package.json` に `engines.node: ">=24.0.0"` を追加（バージョンの正本）、`@types/node` を 24 系へ揃えた。下限を決めているのは testcontainers（→ undici@8）の `>=22.19.0` |
| 47 | `costom-date.ts` のファイル名修正 | 完了 | 低 | （再掲・§2.4）issue #84 で対応 |

### 2.6 デザイン刷新（issue #135）

採用担当者が読み手であることを前提に、トップページを「書類（職務経歴書）」として再設計する。
親 issue #135 を 3 つのサブ issue に分割し、土台 -> 部品 -> 画面の順に実装した。

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 75 | コンポーネント設計レポートの実装への追随 | 完了 | 低 | issue #147（親 #135）。#135 の完了条件「`docs/component-design-report/` の記述との整合を確認」で実施。**3 ファイルとも旧デザイン（グラスモーフィズム + ネオン）の記述のまま**だった。`cn()` の呼び出し数は 11 と書かれていたが実測 7、`Header` の `isScrolled` は実装ごと消滅、`Badge` の `size` / `SocialLinks` の `size` も廃止済みだった。あわせて docs/04 §5.3 のアクセシビリティ推奨事項（対応済み 2 件・対象消滅 1 件）と §7.2 の使用 CSS 機能表（`backdrop-filter` / `mask-composite` は廃止、`oklch()` の互換性を追記）を棚卸しした |
| 74 | クライアントロジックの `hooks/` への切り出し | 完了 | 低 | issue #138 のセルフレビューで検出。`frontend.md`「クライアントコンポーネントのロジックはカスタムフックへ」に対し、`ThemeToggle` が DOM と Cookie への書き込みを内部に持っていた。`src/hooks/useTheme.ts` を新設（本プロジェクト初の `hooks/`）。**状態は返さない**（初期描画時点では「いまどちらのテーマか」が決まらないため）。`useCallback` で参照を安定させ、呼び出し側が `useEffect` の依存配列へ入れても再実行を誘発しないことをテストで固定 |
| 73 | 全セクションの再構成とテーマ切替 UI | 完了 | 中 | issue #138（親 #135）。Hero / About / Career / Contact / Footer と Header を書類の体裁へ作り替え、`ThemeToggle` を追加。**`layout.tsx` を `async` 化し Cookie から `<html data-theme>` を解決**するため、`/_not-found` が静的から動的（`ƒ`）へ変わる。これはトレードオフを承知の上の判断で、`<html>` 要素にテーマを載せない限り FOUC を避けられないため（docs/09 §6.7）。`summarizeCareers` で Hero の実績バンド（件数 / 技術数 / 経歴開始年）を算出する |
| 72 | 技術スタックの 9 区分への分類 | 完了 | 中 | issue #137（親 #135）。1 案件あたり最大 30 件がフラットに並び、読み手が信号とノイズを分離できなかった問題に対応。**件数を減らすのではなく分類する**方針（掲載データを変えない制約があるため）。`src/types/tech-category.ts` / `src/constants/tech-categories.ts`（実データ準拠の 82 件）/ `src/lib/group-tech-stack.ts` を追加し、`CareerCard` はチップ表示へ |
| 71 | 配色トークンとテーマ解決機構 | 完了 | 中 | issue #136（親 #135）。**画面の変更を含まない土台のみ**の回。`globals.css` に 11 種のトークンを定義し、`:root` / `@media (prefers-color-scheme: dark)` / `[data-theme='light']` / `[data-theme='dark']` の 4 ブロックで値を割り当てる。`src/types/theme.ts` / `src/constants/theme.ts` / `src/lib/theme.ts`（`parseTheme` / `serializeThemeCookie`）を追加。`design-tokens.test.ts` が `globals.css` を実際に解析し、4 ブロックの網羅・カスケード順・コントラスト比（WCAG 2.1 AA）を検証する |

**掲載データを変えない制約**: 本刷新は「GCS の JSON とハードコード文字列を変更しない」前提で行った。
そのため打ち手は**配置・分類・強弱**に限られ、文言の追加・削除は行っていない。
Hero のリード文は新規に書き起こしたものではなく、`about_contents[1]` を移設したもの。

### 2.7 掲載セクションの再構成（issue #125）

Skills を取り下げ、ブログ・個人開発・AI 使用方法の 3 セクションを追加する。
**`PortfolioData` と `NavbarData` を 4 件すべてが触るため、1 件ずつ直列で進める。**

掲載データは GCS の JSON へ手書きする（外部 API からの自動取得は行わない）。
`src/repositories/gcs.ts` が `JSON.parse` の結果を検証せずに返すため、**型を増やしても
GCS 側が古いままだと型エラーにならず実行時に壊れる**。したがって各回とも
**GCS への投入がデプロイより先**になる。

| # | タスク名 | ステータス | 優先度 | 備考 |
|---|---------|-----------|--------|------|
| 78 | セクションの organisms 化と `client.tsx` の合成ルート化 | 完了 | 中 | issue #153。セクション追加のたびに `client.tsx` が伸び 296 行に達していた（`section-heading` の重複 5 箇所）。**根本原因は自前の Organisms 定義**で、「状態を持つもの」と定義していたため状態を持たないセクションの置き場所が無かった。Atomic Design の定義に状態は含まれないため定義を改め、7 セクションを organisms へ切り出した（`client.tsx` は 296 → 87 行）。`SectionHeading` を molecule として抽出。**副産物として `formatCareerPeriod` と `about_contents` の分割が `lib/` へ出てユニットテスト可能になった**（それまで `client.tsx` の private 関数で E2E 経由でしか踏まれていなかった）。テストは 299 → 344 件。**E2E は 1 行も変更していない**（見た目が変わっていないことの根拠） |
| 77 | 執筆記事セクションの追加 | 完了 | 中 | issue #127（親 #125）。`ArticleData` / `ArticleItem` と `ArticleEntry` を追加し、Product の後ろへ配置（ナビは 5 項目へ）。**見出しは `Blog` ではなく `Articles`**（Product に自作のブログ基盤「ブログWebアプリ」があり、`Blog` だと「作ったもの」と「書いた記事」が同じ語で並ぶ）。掲載は Zenn のいいね数上位 3 件で、**いいね数は画面に出さない**（手書きデータでは実数とずれ続けるため、選定基準としてのみ使う）。概要文は記事本文から作成。カードではなく罫線区切りの行で組む（記事は件数が増えやすく 1 件の情報量が小さいため）。UT 8 件（正常系 2 : 準正常系+異常系 6）。**変異注入で `queryAllByRole('link')` が `<a href="">` を検出できないことが判明**し、`container.querySelectorAll('a')` へ改めた |
| 76 | 個人開発セクションの追加 | 完了 | 中 | issue #128（親 #125）。`ProductData` / `ProductItem` と `ProductCard` を追加し、Career の直後へ配置（ナビは 4 項目へ）。**スクショ画像は持たない**（`images: { unoptimized: true }` で原寸配信になり docs/04 の LCP 目標に響く。site リンクから実物を見に行けるため情報は途切れない）。プロダクト名を `product_name` ではなく **`product_title`** にしたのは `NavbarData.product_name` との衝突を避けるため。URL が空文字・空白のみならそのリンクを描画しない（UT 7 / E2E 2 ケース。`trim()` 除去と `rel` 削除の 2 変異で検出力を確認済み） |

> Skills セクションの削除（issue #126 / 親 #125）はタスク #68 として §2.4 に記録している。

残り: #129（AI 使用方法）。表示順は Career → 個人開発 → AI → 執筆記事（Articles）であり、
AI セクションは Product と Articles の間に入る。

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
| 完了 | 66 |
| 未着手 | 8 |
| 検討中 | 4 |
| **合計** | **78** |

| 優先度 | 件数 |
|--------|------|
| 最高 | 5 |
| 高 | 25 |
| 中 | 35 |
| 低 | 13 |
| **合計** | **78** |

> 直近の完了（番号は本ドキュメントのタスク番号。GitHub issue 番号は各行の備考を参照）: #78（セクションの organisms 化）、#77（執筆記事セクション）、#76（個人開発セクション）、#75（コンポーネント設計レポートの追随）、#30（コンポーネントテスト）、#74（クライアントロジックの hooks/ 切り出し）、#73（全セクションの再構成とテーマ切替 UI）、#72（技術スタックの 9 区分化）、#71（配色トークンとテーマ解決機構）、#43（ライトモード / テーマ切替）、#70（ESLint 9 + flat config）、#69（Node バージョン統一）、#53（実行環境の Node 整合）、#68（Skills セクション削除）、#67（React 19 移行）、#66（markdownlint 導入）、#65（Secret scan ジョブ）、#64（デッドコード整理）、#47（ファイル名のタイプミス修正）、#63（lib/ の配置ルール確定）、#62（件名のヘッダーインジェクション対策）、#61（CORS 判断・レートリミット・CSP）、#45（レート制限）、#60（ログ方針・統一エラーレスポンス）、#59（メール HTML の XSS 対策）、#58（next 15.5.25）、#57（next 14.2.35）、#56（server-first 化）、#55（JSDoc 45 件）、#48（ローディング/エラー状態のアクセシビリティ改善）。残る未着手の主なもの: #52（カバレッジ閾値）、#41（OGP 画像）、#39（Google Analytics）。
>
> 件数は 2026-09-22（issue #138）に実テーブルから再集計した。再掲行（#30 / #47）は 1 件として数える。
> 従来のステータス表は内訳が合計と一致していなかった（55 + 9 + 4 = 68 に対し合計 73 行）。
> 実際の未着手が 11 件だったため、合計側が正しく、ステータス別の内訳を修正した。
> **タスク #44（Error Boundary）は未着手として残っていたが、issue #76 の server-first 化で
> `src/app/error.tsx` として実装済みだった**ため、本更新で完了に改めた。

---

## 5. 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2026-09-23 | Terraform の state / tfvars を共有 GCS バケットの `nextjs-intro-app/` へ移し、既存リソースを `import` で取り込み（issue #155）。state が失われたまま CI の `gcloud` でデプロイが回っており、#62 の `SITE_URL` が本番未反映だったことが判明したため併せて反映。CI に `terraform fmt` / `validate` を追加。`.gitignore` で `.env` / `.env.production` が除外されていなかった穴も是正 | - |
| 2026-09-22 | 7 セクションを organisms へ切り出し、`client.tsx` を合成ルートにした（issue #153）。Organisms の定義が「状態を持つもの」になっており、それが構造を縛っていたため定義から改めた。テスト 299 → 344 件 | - |
| 2026-09-22 | 執筆記事セクション（Articles）を追加（issue #127 / 親 #125）。Zenn のいいね数上位 3 件を掲載し、いいね数自体は表示しない判断。欠損フィールドの落とし方（中黒・リンク化）を UT で固定 | - |
| 2026-09-22 | 個人開発セクションを追加（issue #128 / 親 #125）。掲載データは GCS へ手書きし、スクショ画像は持たない判断。URL の欠損でリンクを出し分ける挙動を UT / E2E で固定 | - |
| 2026-09-22 | `docs/component-design-report/` 3 ファイルを現在の実装へ同期（issue #147 / 親 #135）。旧デザインの記述が全面的に残っていたため書き直し、docs/03 §6.1・§6.4、docs/04 §5.3・§7.2 の乖離も併せて是正 | - |
| 2026-09-22 | コンポーネントテストを全 9 コンポーネント + `useTheme` へ拡充し、タスク #30 を完了（issue #141）。あわせて `ThemeToggle` のロジックを `src/hooks/useTheme.ts` へ切り出し（タスク #74）。docs/08 §4.3〜4.5 の未実装時点の計画表は実装と二重管理になっていたため削除し、§4.7 へ一本化 | - |
| 2026-09-22 | 全セクションを書類の体裁へ再構成し、テーマ切替 UI を追加（issue #138 / 親 #135）。`layout.tsx` の `async` 化により `/_not-found` が動的化するトレードオフを承知で採用。コンポーネントテストの前提だった JSX 変換設定（Vite 8 = oxc）も解消し、タスク #30 に着手 | - |
| 2026-09-22 | 技術スタックを 9 区分へ分類する `groupTechStack` を追加（issue #137 / 親 #135）。掲載データを変えずに、最大 30 件のフラットな列挙を読める形にした | - |
| 2026-09-22 | 配色トークンとテーマ解決機構を追加（issue #136 / 親 #135）。画面は変えず土台のみ。`globals.css` を解析してコントラスト比まで検証するテストを併設 | - |
| 2026-09-21 | ESLint 9 + flat config へ移行し、`next lint` から ESLint CLI へ切替。検出能力の維持を違反の混入 8 項目で実証（issue #133）。#88 のブロッカーが 0 件になった | - |
| 2026-09-21 | Node バージョンを 24 に統一。本番 v18 / CI 24 / 型定義 26 相当の 3 層の不整合を解消し、`engines.node` を正本として明記（issue #130 / タスク #53） | - |
| 2026-09-21 | Skills セクションをコード・型・データごと削除。ドキュメント 12 ファイル・56 箇所を追随させ、`cn()` 解説の題材を差し替え（issue #126 / 親 #125） | - |
| 2026-09-20 | React 19.3.0 へ移行。`forwardRef` は互換性が維持されるため据え置き、実ブラウザで ref 透過と非推奨警告 0 件を確認。dependabot の react メジャー除外を解除（issue #104） | - |
| 2026-09-20 | markdownlint を CI に導入。ルールを取捨選択して違反 0 件にし、その過程で docs/09 のコードフェンス破損・目次リンク切れ 12 件・runbook の番号誤りを解消（issue #79） | - |
| 2026-09-20 | 鍵・`.env` の Git 混入を検出する Secret scan ジョブを CI に追加。GitHub ネイティブの secret scanning が未有効であることを検出し、多層防御の位置づけを docs/06 §11 に整理（issue #61） | - |
| 2026-09-20 | デッドコード 2 件を削除し、`costom-date.ts` を `custom-date.ts` へリネーム。docs/07・08 の該当記述と docs/10 の解決済み既知課題も整理（issue #84 / タスク #47） | - |
| 2026-09-20 | `lib/` 配下への定数・型の配置ルールの解釈を確定（集約先としての禁止）。`coding-standards.md` / `frontend.md` を同期し、公開関数の戻り値型の export 例外も明文化（issue #115） | - |
| 2026-09-20 | 問い合わせメール件名のヘッダーインジェクション対策を実装。`sanitizeHeaderValue()` で制御文字を除去し、`replyTo` はスキーマが唯一の防御である前提をテストで固定（issue #114 / #55 の派生） | - |
| 2026-09-20 | CORS・レートリミット・CSP の方針を決定し実装。CORS は同一オリジン専用のため見送り（ルールへ適用範囲を追記）、`POST /api/contact` に 10分/5回 のレートリミット、nonce ベース CSP と固定セキュリティヘッダーを追加（issue #60 / 親 #53） | - |
| 2026-09-20 | ログ方針を `src/lib/logger.ts` へ集約し、エラーレスポンスを `ApiErrorResponse`（`{ error: string }`）へ統一。本番でエラーが残らない問題と、`/api/portfolio` が内部エラーメッセージを返す問題を解消（issue #59 / 親 #53） | - |
| 2026-09-20 | 問い合わせメール HTML のユーザー入力をエスケープ。`src/lib/html-escape.ts` を新設し、入力検証（Zod）と出力エスケープを別レイヤの対策として整理（issue #55 / 親 #53） | - |
| 2026-09-20 | ドキュメントと実装の乖離を是正。`data-server.ts` 等の旧パス 16 箇所（docs/02・05・08・09・10・11）を `repositories/` / `schemas/` 移設後の実態へ更新し、タスク統計サマリを再集計（issue #55 のセルフレビューで検出） | - |
| 2026-09-19 | フォームのアクセシビリティを改善。`htmlFor` 関連付け・`aria-describedby` / `aria-invalid`・送信結果の `role` 通知に対応（issue #83） | - |
| 2026-09-19 | actionlint を CI に導入。ワークフロー 3 本の検証と `run:` ブロックの shellcheck が入った（issue #78） | - |
| 2026-09-19 | 依存監査を導入（Dependabot + CI の 2 段構え）。本番依存 critical をブロッキング、全レベルを可視化（issue #80） | - |
| 2026-09-19 | `api/contact` のバリデーションを `ContactFormSchema` に統一し、`name` / `email` の長さがサーバー側で未検証だった穴を塞いだ。スキーマを `src/schemas/` へ昇格（issue #82） | - |
| 2026-09-19 | `next` を 15.5.25 へ更新し、next のアドバイザリを 0 件にした（issue #86 フェーズ1） | - |
| 2026-09-19 | `next` を 14.2.35 へ更新し、既知脆弱性 12 件を解消（issue #81） | - |
| 2026-09-19 | `page.tsx` を server-first 構成へ作り替え、初期 HTML に本文を含めた。`lib/` の外部 I/O を `repositories/` へ移設（issue #76） | - |
| 2026-09-19 | `jsdoc/require-jsdoc` を `contexts` 指定で導入し、JSDoc 欠落を lint で検出できるようにした。末尾 `export { X }` 形式が検出対象外である制約を jsdoc.md に明記（issue #69 / 親 #64） | - |
| 2026-09-19 | JSDoc 付与を完了。`src/app/` ルート + テスト足場（4 シンボル）へ付与し、欠落 45 件を解消（issue #68 / 親 #64） | - |
| 2026-09-19 | JSDoc 付与を継続。`src/components/`（17 シンボル）へ付与。あわせて docs/04 §5.2 の `<label>` に関する記述を実態（`htmlFor` 未対応）へ修正（issue #67 / 親 #64） | - |
| 2026-09-19 | JSDoc 付与を継続。`src/lib/` + `src/app/api/`（8 シンボル）へ付与（issue #66 / 親 #64） | - |
| 2026-09-19 | JSDoc 付与に着手。`src/types/` + `src/utils/`（16 シンボル）へ付与（issue #65 / 親 #64） | - |
| 2026-09-19 | 独自ドメイン `introtechkkplus.com` へ切り替え。`metadataBase` / canonical / sitemap.xml / robots.txt を追加し、`NEXT_PUBLIC_SITE_URL` を `SITE_URL` へ整理（issue #62） | - |
| 2026-07-08 | テスト基盤導入（UT/IT/E2E）と CI 整備、JSDoc lint・ルール拡充を完了（PR #21〜#25）。残タスク（#30/#52/#53）を追記 | - |
| 2026-03-20 | タスク管理ドキュメント初版作成 | - |
| 2026-03-15 | Skills アニメーション遅延バグ修正完了（PR #12） | - |
| 2026-03-15 | LICENSE 追加（PR #13） | - |
| 2026-01-22 | 日付表示バグ修正、要件定義書修正 | - |
| 2025-06-21 | GitHub Actions CI/CD パイプライン修正完了（PR #2 - #6） | - |
