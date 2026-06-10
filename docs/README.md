# ドキュメント索引

TechProfile Pro（ソフトウェアエンジニアのポートフォリオサイト）の仕様・設計ドキュメント一覧。プロジェクト概要・セットアップ手順はリポジトリ直下の [`../README.md`](../README.md) を参照。

ドキュメントは 2 層で構成している。

- **標準仕様書（`01`〜`11`）** — 仕様の正準。番号順に読むと全体像をつかめる。
- **[`component-design-report/`](./component-design-report/)** — コンポーネント設計レポート（Atomic Design / cn / forwardRef）。

## 読み進め順（おすすめ）

`01 要求 → 02 要件 → 03 機能 → 05 データ → 06 セキュリティ → 07 API → 08 テスト → 09 アーキテクチャ`。
04・10・11 は随時参照。初めて環境構築する場合は [`../README.md`](../README.md#-クイックスタート) のクイックスタートから。

## 標準仕様書

| # | ドキュメント | 概要 |
|---|---|---|
| 01 | [要求仕様書](./01-business-requirements.md) | 業務要件・ビジネス要件・目的・スコープ |
| 02 | [要件仕様書](./02-requirements-specification.md) | 機能要件・非機能要件・受け入れ条件 |
| 03 | [機能仕様書](./03-functional-specification.md) | 画面仕様・挙動・UI/UX 方針 |
| 04 | [非機能仕様書](./04-non-functional-specification.md) | パフォーマンス・可用性・保守性・対応環境 |
| 05 | [データ仕様書](./05-data-specification.md) | データモデル（`src/types/portfolio.ts`）・データフロー |
| 06 | [セキュリティ仕様書](./06-security-specification.md) | 認証・認可・環境変数・入力バリデーション |
| 07 | [API 仕様書](./07-api-specification.md) | `GET /api/portfolio` / `POST /api/contact`・キャッシュ |
| 08 | [テスト仕様書](./08-test-specification.md) | テスト戦略・テストケース（※未導入。推奨: Vitest / Playwright） |
| 09 | [アーキテクチャ仕様書](./09-architecture-specification.md) | 技術スタック・構成・依存関係・デプロイ（Cloud Run） |
| 10 | [その他仕様書](./10-miscellaneous-specification.md) | 用語・CI/CD・上記に分類されない仕様 |
| 11 | [タスク](./11-tasks.md) | 完了済み実績・将来課題 |

## component-design-report/ — コンポーネント設計レポート

| ドキュメント | 対象 |
|---|---|
| [01. Atomic Design](./component-design-report/01-atomic-design.md) | atoms / molecules / organisms の設計方針 |
| [02. cn() ユーティリティ](./component-design-report/02-cn-utility.md) | `clsx` + `tailwind-merge` のクラス結合 |
| [03. React.forwardRef](./component-design-report/03-forward-ref.md) | ref 転送と `displayName` の設計 |

## 関連

- 開発ルール: [`../CLAUDE.md`](../CLAUDE.md) と [`../.claude/rules/`](../.claude/rules/)
- ドキュメント更新の影響マップ（変更種別 → 更新必須ドキュメントの逆引き）: [`../.claude/rules/documentation.md`](../.claude/rules/documentation.md)
