---
description: JSDoc（TSDoc）ドキュメンテーションコメント規約 — TypeScript の公開シンボルに必須
globs: src/**
---

# JSDoc 規約（TypeScript）

TypeScript コードの**公開シンボル**には JSDoc（TSDoc 記法）を**必須**とする。TypeDoc によるドキュメント生成を前提とする。

## 必須対象（公開シンボル）

以下の公開シンボルには JSDoc を必ず付与する:

- `export` された関数・クラス・メソッド・型（`type` / `interface`）・定数
- React/Vue コンポーネントの **props 型**（各プロパティに説明）
- カスタムフック（`useXxx`）・composable（`useXxx`）
- 公開 API のハンドラー・サービスメソッド

**任意対象**: `export` されない内部関数、および処理が自明な 1 行ユーティリティ。ただし意図が非自明なものは内部でも付与する。

## 混乱テスト（公開/内部・本番/テストを問わない）

判断軸は「public か否か」ではなく **「1 か月後の自分／他プロジェクト帰りの読み手が『これは何？なぜ？』となるか」**。なるなら、内部関数でもテストコードでも "why" を残す。

- **キャスト・回避策には "why" 必須**: `as unknown as` / `as any` / `@ts-ignore` / `@ts-expect-error` / マジック値 / 複雑な正規表現 / 明示的なワークアラウンド。**型を欺く・仕様を迂回する箇所は、その根拠（なぜ安全か／なぜ必要か）がコードから消える**ため、コメントが唯一の記録になる。
  - 例: テストダブルを `repo as unknown as Repository<Task>` で注入する場合、「ダブルは対象が実際に呼ぶメソッドだけの部分実装で、実型は構造的に大きいため二段キャストで隙間を埋める（実行時は使う分だけで足りる）」と残す。
- **テスト足場**（SUT ビルダー・複雑な fixture・非自明な mock）も、意図が読み取りにくいなら付ける。

## 記述ルール

- **型は書かない**: 型は TypeScript のシグネチャが唯一の真実（source of truth）。JSDoc に `{string}` 等の型ブレースを併記しない（二重管理・型ずれの原因になる）。JSDoc は**意図・意味・制約**を日本語で記述する。
- **要約行必須**: 1 行目にそのシンボルが「何をするか」を簡潔に書く。
- **`@param` 必須**: 全引数に `@param name - 説明` を記述する。オプション引数・デフォルト値の意味も明記する。
- **`@returns` 必須**: 戻り値がある場合は `@returns 説明` を記述する（`void` / JSX 返却のコンポーネントは省略可）。
- **`@throws` 必須**: 意図的に例外を投げる場合は `@throws {ErrorType} 発生条件` を記述する。
- **補助タグ（任意）**: `@example` `@deprecated` `@see` は必要に応じて使う。

## 例

```ts
/**
 * ユーザー ID から表示名を解決する。キャッシュに無ければ API を叩く。
 *
 * @param userId - 対象ユーザーの UUID
 * @param opts - 解決オプション（`force` 指定でキャッシュを無視）
 * @returns 表示名。ユーザーが存在しない場合は `null`
 * @throws {ApiError} API 通信に失敗した場合
 */
export async function resolveDisplayName(
  userId: string,
  opts?: { force?: boolean },
): Promise<string | null> {
  // ...
}
```

## Lint による強制（導入済み）

`eslint-plugin-jsdoc` を導入し、**flat config（`eslint.config.mjs`）の `files: ['src/**/*.ts', 'src/**/*.tsx']`** で機械判定可能なルールを適用している。`settings.jsdoc.mode: "typescript"` で TS モードを有効化。

> **flat config は配列を上から順に適用し、後の要素が前を上書きする。** レガシー config の `overrides` 2 段（`src/**` → `src/**/*.tsx`）は、配列にこの順で並べることで等価になる。**順序を入れ替えると `.tsx` の `require-returns` を off にする意図が消える**ため、要素の並び替えは慎重に行うこと（issue #133）。

| ルール | レベル | 目的 |
|---|---|---|
| `jsdoc/no-types` | error | 型の再掲を禁止（TS シグネチャが型の唯一の真実） |
| `jsdoc/require-param` | error | JSDoc ブロックを持つ関数は全引数を `@param` で説明（分割代入 props は型が真実のため展開しない: `checkDestructured: false`） |
| `jsdoc/require-param-description` | error | `@param` に説明文を必須化 |
| `jsdoc/check-param-names` | error | `@param` 名と実引数名の突き合わせ（名前ズレ・順序・過不足を検出） |
| `jsdoc/require-returns` | error | 返り値がある関数は `@returns` を必須化（後述の `.tsx` を除く） |
| `jsdoc/require-returns-description` | error | `@returns` に説明文を必須化 |
| `jsdoc/check-alignment` | warn | JSDoc ブロックの体裁を整える |
| `jsdoc/no-multi-asterisks` | warn | アスタリスクの重複を検出 |
| `jsdoc/require-jsdoc` | error | 公開シンボルへの JSDoc ブロックの**有無**を検査（`contexts` で対象を限定） |

- **`.tsx`（React コンポーネント）は `require-returns` / `require-returns-description` を off**: JSX を返す要素に「@returns …の要素」を書くのはノイズになるため。`.ts`（フック / lib / API）では `@returns` 必須のまま。
- **`require-jsdoc` は `contexts` を指定して採用している。** 素の `require-jsdoc` は行コメント（`//`）を誤検知するが、対象ノードを限定し `publicOnly: true` で export 済みシンボルに絞ることで、誤検知なしに運用できる。
- 参考: 上記方針は `youtube-my-collection`（ESLint 9 フラット config）から移植したもの。本プロジェクトも issue #133 で ESLint 9 + flat config へ移行したため、現在は両者とも同じ形式。

### `require-jsdoc` の設定

```js
'jsdoc/require-jsdoc': [
    'error',
    {
        publicOnly: true,
        require: { FunctionDeclaration: false },
        contexts: [
            'FunctionDeclaration',
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'VariableDeclaration',
        ],
    },
],
```

### `require-jsdoc` が検出できない形式（重要）

導入時に 6 種類の export 形式で実挙動を検証した結果、**1 つだけ検出できない形式がある**。

| 形式 | 検出 |
|---|---|
| `export function foo() {}` | ✅ |
| `export interface Foo {}` | ✅ |
| `export type Foo = ...` | ✅ |
| `export const foo = ...` | ✅ |
| `export default function foo() {}` | ✅ |
| `const foo = ...` を書き、末尾で `export { foo }` | ❌ |

最後の形式は、`publicOnly` の ESM 追跡が**別文の `export { foo }` を宣言ノードに結び付けられない**ために漏れる。

**したがって、宣言と同時に export する形式（`export function` / `export const` / `export interface`）を使うこと。**
末尾でまとめて `export { ... }` する形式は lint の網から外れるため、新規コードでは避ける。
既存の atoms（`Button` / `Input` / `TextArea` / `Badge`）はこの形式を使っており、JSDoc は付与済みだが lint では保護されていない。
