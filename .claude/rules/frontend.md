---
description: Next.js (App Router) フロントエンド設計・コンポーネント規約
globs: "src/components/**,src/app/**,src/hooks/**,src/lib/**,src/repositories/**,src/schemas/**,src/constants/**,src/types/**"
---

# フロントエンドルール（Next.js App Router）

## コンポーネント設計

プロジェクト規模・ドメイン数に応じて以下のいずれかを選択する:

| パターン | 構成 | 採用基準 |
|---|---|---|
| **アトミックデザイン** | Atoms / Molecules / Organisms / Pages | 小〜中規模・ドメインが少ない |
| **ドメイン別構成** | features/ 配下にドメイン単位で分割 | 中〜大規模・ドメインが多い |

## サーバー/クライアント分離

- **server-first** を基本とする。データ取得・SEO はサーバーコンポーネントで行う。
- server/client 境界を明確にするためファイルを分離する:
  - `page.tsx` — サーバーコンポーネント（データ取得・SEO・props 受け渡し）
  - `client.tsx` — クライアントコンポーネント（インタラクション・状態管理）

## ロジック分離

- **クライアントコンポーネント**のロジックは**カスタムフック**（`hooks/`）に切り出す。コンポーネントは UI 描画に専念する。
- **サーバーコンポーネント**のデータ取得は `page.tsx` から `repositories/` の関数を呼んで行う（hooks は使用しない）。

## 関心別にディレクトリを切る

`types/` `constants/` `schemas/` `repositories/` は**それぞれ独立したディレクトリ**として `src/` 直下に置く。いずれも**単一ファイルにまとめない**（ドメイン単位で分ける）。配置・昇格の判断軸は `coding-standards.md`「型・定数・スキーマの配置」に従う。

| ディレクトリ | 置くもの | 置かないもの |
|---|---|---|
| `types/` | 2 箇所以上から参照される型 | 値・ロジック |
| `constants/` | 全環境で不変な値 | 環境変数・型を導出する定数（`types/` 側へ） |
| `schemas/` | Zod スキーマ（フォーム・API レスポンスの検証） | 検証を伴わない型定義（`types/` へ） |
| `repositories/` | **外部 I/O**（`fetch` / API クライアント / ストレージ・メール等の外部サービス呼び出し） | UI・画面都合の整形・業務判断 |
| `lib/` | **通信を持たない純粋ユーティリティ**（日付整形・計算等） | 外部 I/O（`repositories/` へ）・定数・型 |

- **`fetch` や外部サービスクライアントを書いてよいのは `repositories/` だけ**。コンポーネント・hooks・`lib/` から直接叩かない。呼び出し口を 1 箇所に閉じることで、認証情報の扱い・エラー処理・リトライが散らばらない。
- ディレクトリ名は**複数形で統一**する（`types` / `constants` / `schemas` / `repositories`）。
- **サーバー専用モジュール（シークレットを読む処理・外部サービスクライアント）を Client Component から import しない。**

### ディレクトリ構成

```
src/
├── app/                    # ルーティング（App Router）
│   └── {route}/
│       ├── page.tsx        # Server Component（データ取得・合成）
│       └── client.tsx      # Client Component（対話・状態）
├── components/             # 設計選択に従う（ui/common/feature または features/ 配下）
├── hooks/                  # クライアントロジック（useXxx）
├── repositories/           # 外部 I/O（ドメイン単位で分割）
├── schemas/                # Zod スキーマ（フォーム・API レスポンス検証）
├── lib/                    # 純粋ユーティリティ（通信しない）
├── constants/              # 共通定数（環境変数は置かない）
└── types/                  # 型定義
```

## バリデーション

- フォームバリデーションには **react-hook-form + Zod**（`zodResolver`）を使用する。スキーマは `schemas/` に置き、フォームの型は `z.infer<typeof schema>` で導出する。
- **クライアント検証は UX のためのものであり、セキュリティ担保ではない**。Route Handler / Server Action / バックエンドでも必ず検証する（信頼境界が違うため、この重複は必要）。
- **Server Action の引数も必ずサーバー側で `parse` する**。Server Action は公開エンドポイントと同等であり、フォームを経由せず直接呼び出せる。
- BFF と同じ入力ルールなら、**同じ Zod スキーマを `schemas/` から共有**する。

## インポート

- `@/*` パスエイリアスを使用する（相対パスの深いネストを避ける）。

## テスト

- E2E: Playwright（`e2e/` ディレクトリ）
- Base URL: `http://localhost:3000`
