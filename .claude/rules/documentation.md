---
description: ドキュメント更新・設計書管理ルール（影響マップ + opt-out の完了条件）
globs: 
---

# ドキュメント

コード変更がドキュメント（CLAUDE.md / README.md / docs/）と乖離しないことを構造的に担保する。

## 完了条件（opt-out）

変更は、下記「影響マップ」の対応ドキュメントを**同一 PR 内で更新する**ことを完了条件とする。

- 更新不要と判断した場合は、**PR 説明にその理由を明記する**（省略＝未対応とみなす）。
- この乖離チェックは `/self-review` と `/pr-create` の確認対象に含まれる。

## 影響マップ（変更種別 → 更新必須ドキュメント）

「どのドキュメントだっけ？」を考えさせないための逆引き表。

| 変更種別 | 更新必須ドキュメント |
|---|---|
| プロジェクト概要・技術スタック・ルール構成の変更 | CLAUDE.md / README.md |
| セットアップ手順・スクリプト・利用方法の変更 | README.md |
| 業務要件・ビジネス要件の変更 | docs/01-business-requirements.md |
| 要件定義の変更 | docs/02-requirements-specification.md |
| 機能追加・変更（画面・挙動） | docs/03-functional-specification.md |
| 非機能要件（パフォーマンス・可用性等）の変更 | docs/04-non-functional-specification.md |
| データ構造・モデルの変更 | docs/05-data-specification.md |
| 認証・認可・セキュリティの変更 | docs/06-security-specification.md |
| API エンドポイント・I/F の変更 | docs/07-api-specification.md |
| テスト方針・テストケースの変更 | docs/08-test-specification.md |
| アーキテクチャ・構成・依存関係の変更 | docs/09-architecture-specification.md |
| 上記に分類されない仕様の変更 | docs/10-miscellaneous-specification.md |
| タスク・作業計画の変更 | docs/11-tasks.md |
| コンポーネント設計方針（Atomic Design / cn / forwardRef 等）の変更 | docs/component-design-report/ |

該当する変更がない場合はスキップする。

## 補足

- **設計書の管理**: タスクごとに設計書を新規作成しない。既存の仕様書ドキュメント（docs/01〜11-*.md, docs/component-design-report/）に追記・更新する。
