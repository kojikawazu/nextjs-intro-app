---
description: Next.js BFF（Route Handlers）設計・API ルール
globs: "src/app/api/**"
---

# API ルール（Next.js BFF / Route Handlers）

## 設計方針

- Next.js App Router の Route Handlers を BFF（Backend for Frontend）として使用する。
- BFF 層はフロントエンドとバックエンドの橋渡しに徹する。薄く保つ。
- バックエンド API の呼び出し・レスポンス整形・認証トークン付与を担当する。

## ディレクトリ構成

```
src/app/api/
├── health/route.ts    # ヘルスチェック
├── auth/              # 認証関連
│   └── route.ts
└── {resource}/        # リソース別
    └── route.ts
```

## 共通方針

- RESTful 設計（リソース指向エンドポイント）
- レスポンス形式: JSON（`NextResponse.json()`）
- API 呼び出しロジックは `lib/api-client.ts` に集約し、Route Handler 自体は薄く保つ
- 入力バリデーションは Route Handler 内で実施（Zod 等）
- エラー時は適切な HTTP ステータスコード（400/401/403/404/500）で返す
