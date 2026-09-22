# Atomic Design コンポーネント設計レポート

| 項目 | 内容 |
|------|------|
| プロジェクト名 | TechProfile Pro |
| ドキュメント種別 | コンポーネント設計レポート |
| 作成日 | 2026-03-20 |
| 最終更新 | 2026-09-22（issue #147） |

> **2026-09-22 全面改訂。** デザイン刷新（issue #136 / #137 / #138）でコンポーネントの
> 見た目・Props・内部状態が入れ替わったが、本レポートは旧デザイン（グラスモーフィズム +
> ネオン）の記述のまま残っていた。現在の実装へ同期している（issue #147）。

---

## 目次

- [1. Atomic Design の採用方針](#1-atomic-design-の採用方針)
- [2. Atoms（原子コンポーネント）](#2-atoms原子コンポーネント)
    - [2.1 共通設計原則](#21-共通設計原則)
    - [2.2 Button](#22-button)
    - [2.3 Input](#23-input)
    - [2.4 TextArea](#24-textarea)
    - [2.5 Badge](#25-badge)
    - [2.6 ThemeToggle](#26-themetoggle)
- [3. Molecules（分子コンポーネント）](#3-molecules分子コンポーネント)
    - [3.1 CareerCard](#31-careercard)
    - [3.2 ProductCard](#32-productcard)
    - [3.3 ArticleEntry](#33-articleentry)
    - [3.4 SocialLinks](#34-sociallinks)
- [4. Organisms（生体コンポーネント）](#4-organisms生体コンポーネント)
    - [4.1 Header](#41-header)
    - [4.2 ContactForm](#42-contactform)
- [5. ページレベルの組み立て](#5-ページレベルの組み立て)
    - [5.1 コンポーネント依存ツリー](#51-コンポーネント依存ツリー)
    - [5.2 状態管理](#52-状態管理)
    - [5.3 Atomic Design の階層関係](#53-atomic-design-の階層関係)
- [6. 設計上の特徴と考察](#6-設計上の特徴と考察)
    - [6.1 採用しているパターン](#61-採用しているパターン)
    - [6.2 階層間の責務分離](#62-階層間の責務分離)

---

## 1. Atomic Design の採用方針

本プロジェクトでは Brad Frost が提唱した **Atomic Design** をベースに、UIコンポーネントを3階層で構造化している。Atomic Design 本来の5階層（Atoms → Molecules → Organisms → Templates → Pages）から、Templates 層を省略し、Pages は Next.js App Router の `page.tsx` が担う構成としている。

```text
src/components/
├── atoms/          ← 最小単位の汎用UIパーツ（5コンポーネント）
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── TextArea.tsx
│   └── ThemeToggle.tsx
├── molecules/      ← Atoms を組み合わせた複合コンポーネント（4コンポーネント）
│   ├── ArticleEntry.tsx
│   ├── CareerCard.tsx
│   ├── ProductCard.tsx
│   └── SocialLinks.tsx
└── organisms/      ← 独立した機能単位のコンポーネント（2コンポーネント）
    ├── ContactForm.tsx
    └── Header.tsx
```

**ロジックは階層の外に置く。** クライアントコンポーネントの振る舞い（DOM 操作・保存など）は
`src/hooks/` のカスタムフックへ切り出し、`components/` 配下は描画と操作の割り当てに専念させる
（`frontend.md`「クライアントコンポーネントのロジックはカスタムフックに切り出す」）。
現在は `useTheme`（`ThemeToggle` が使用）の 1 件。

> molecules は issue #128 の `ProductCard`、issue #127 の `ArticleEntry` 追加で 4 件になった。
> 階層の件数は 2026-09-22（issue #141）に実ファイルから数え直した。
> 以前は atoms 4 / molecules 3 と記載されていたが、`ThemeToggle` の追加（#138）と
> `SkillCard` の削除（#126）に追随していなかった。

---

## 2. Atoms（原子コンポーネント）

Atoms は **単一の HTML 要素をラップ** し、プロジェクト固有のスタイルと Props インターフェースを提供する最小単位のコンポーネントである。

### 2.1 共通設計原則

| 原則 | 実装方法 |
|------|---------|
| Props 拡張 | 対応する HTML 要素の属性型を `extends` して継承（例: `ButtonHTMLAttributes<HTMLButtonElement>`）。`ThemeToggle` のみ Props を持たない |
| スタイル合成 | `cn()` ユーティリティでベーススタイル + バリアント + カスタムクラスを結合 |
| ref 転送 | フォーム要素（Button, Input, TextArea）は `React.forwardRef` で ref を外部公開 |
| className 拡張 | `cn()` を使う 4 つは `className` Props を受け取り、外部からのスタイル追加を許容する |
| 配色 | 固定色を書かず、CSS 変数由来の Tailwind クラス（`bg-acc` / `text-ink` / `border-field` 等）だけを使う。トークンの一覧は `docs/03-functional-specification.md` §5.4 |

**バリアント / サイズのマップは module スコープの `const` に置く。** 以前はコンポーネント関数の中で
`const variants = {...}` を組み立てていたが、呼ばれるたびにオブジェクトを作り直す必要がない。
命名は `VARIANT_CLASSES` / `SIZE_CLASSES`（`coding-standards.md`「定数は `UPPER_SNAKE_CASE`」）。

**透過度の修飾子（`text-ink/50` 等）は使えない。** Tailwind が `rgb(var(--x) / <alpha-value>)` の形を
要求するのに対し、トークンは hex / oklch の完成した色だからである。濃淡が要る箇所は専用トークンを足す。

### 2.2 Button

**ファイル**: `src/components/atoms/Button.tsx`

| Props | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| `variant` | `'primary' \| 'outline' \| 'ghost'` | `'primary'` | 外観バリアント |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | サイズ |
| `isLoading` | `boolean` | `false` | ローディング状態（スピナー表示 + disabled） |
| `children` | `ReactNode` | - | ボタンテキスト |

**バリアント定義（オブジェクトマップ方式）**:

```typescript
const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-acc text-acc-on hover:opacity-90',
    outline: 'border border-field text-ink hover:bg-panel',
    ghost: 'text-mute hover:text-ink',
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-7 text-sm',
};
```

バリアントとサイズをオブジェクトマップで管理し、`cn()` で結合するパターンは、条件分岐の複雑化を防ぎ、新しいバリアント追加も容易にする。`Record<NonNullable<...>, string>` で型を付けているため、**バリアントを型に足してマップへ足し忘れると型エラーになる**。

**共通スタイル**: `rounded-sm`（角丸 2px）、`font-bold`、`tracking-wide`、`disabled:opacity-50`

角丸を 2px に抑えているのは、書類の質感に丸みが馴染まないため。旧デザインの `rounded-xl` から変更した。

**フォーカスリング**: `focus-visible:ring-2 ring-acc` に加えて `ring-offset-2 ring-offset-paper` を挟む。
`primary` はアクセント色で塗られているため、オフセットが無いとリングがボタン自身と同化して見えなくなる。

**ローディング状態**:

- `isLoading=true` 時、SVG スピナー（`animate-spin`）をラベルの左に表示
- `disabled` は `disabled || isLoading` で評価するため、呼び出し側が `disabled` を渡さなくても処理中は押せない
- スピナーは `aria-hidden="true"`。状態は `disabled` 属性が伝えるため、装飾を読み上げさせない

**forwardRef**: あり — `React.forwardRef<HTMLButtonElement, ButtonProps>`

### 2.3 Input

**ファイル**: `src/components/atoms/Input.tsx`

| Props | 型 | 説明 |
|-------|-----|------|
| `label` | `string?` | ラベルテキスト（`required` 時にアクセント色のアスタリスク表示） |
| `error` | `string?` | エラーメッセージ（`--warn`、エラー時は枠線も `--warn`） |
| `hint` | `string?` | ヒントテキスト（エラー非表示時のみ表示） |

**エラー状態のスタイル切替**:

```typescript
const hasError = !!error;
cn(
    'block w-full rounded-sm border bg-panel px-3 py-2.5 text-sm text-ink',
    'focus:outline-none focus:ring-2 focus:ring-acc focus:ring-offset-0',
    hasError ? 'border-warn focus:ring-warn' : 'border-field',
    className,
)
```

エラー状態を `boolean` フラグに変換し、`cn()` の条件分岐で警告色/通常のスタイルを切り替えている。`error` と `hint` は排他表示（error 優先）。

**枠線に `--rule`（装飾罫線）ではなく `--field` を使う。** WCAG 1.4.11 は操作できる部品の境界に 3:1 を
要求しており、装飾用の細い罫線ではこれを満たせない（`docs/04-non-functional-specification.md` §5.2）。

**フォーカスリングは `focus-visible:` ではなく `focus:` で出す。** `focus-visible` はブラウザが
「キーボード操作らしい」と判断したときだけ発火するため、クリックでフォーカスした入力欄にリングが出ない。
いまどこに入力しているかは操作手段によらず示す必要がある。`Button` / `Header` / `SocialLinks` /
`ThemeToggle` は逆に `focus-visible:` を使う（クリックした瞬間にリングが出ると煩わしいため）。

**ラベルと支援技術への対応**:

| 仕組み | 内容 |
|--------|------|
| `useId()` | 呼び出し側が `id` を指定していればそれを、なければ生成した id を使う |
| `htmlFor` / `id` | `<label>` と `<input>` を関連付ける。**描画していることと関連付けていることは別**で、関連付けが無いとラベルをクリックしてもフォーカスが移らず、読み上げも対応を伝えない |
| `aria-describedby` | エラー表示中は error、それ以外で `hint` があれば hint を指す（両方は指さない） |
| `aria-invalid` | エラー時のみ `true` |

**forwardRef**: あり — `React.forwardRef<HTMLInputElement, InputProps>`

### 2.4 TextArea

**ファイル**: `src/components/atoms/TextArea.tsx`

Input と同一のインターフェース設計。追加で `min-h-[120px]` と `resize-y` を適用。ラベルの関連付け・`aria-describedby` / `aria-invalid`・エラー処理・ヒント表示のロジックも Input と同一パターンで実装されている。

**forwardRef**: あり — `React.forwardRef<HTMLTextAreaElement, TextAreaProps>`

### 2.5 Badge

**ファイル**: `src/components/atoms/Badge.tsx`

| Props | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| `variant` | `'accent' \| 'outline'` | `'accent'` | 外観バリアント |

```typescript
const VARIANT_CLASSES: Record<NonNullable<BadgeProps['variant']>, string> = {
    accent: 'bg-acc text-acc-on',
    outline: 'border border-rule text-mute',
};
```

**用途は状態表示に限られる。** 旧デザインでは技術スタックの羅列にも使っていたが、分類集約
（issue #137）とチップ表示へ置き換えたため、現在の使用箇所は `CareerCard` の「現在」バッジのみ。
これに伴い `size` Props と `default` / `secondary` バリアントは廃止した。

**`<div>` ではなく `<span>`。** 見出しやタイトルの行内に置くため、ブロック要素だと文章の途中に挟めない。
Props も `HTMLAttributes<HTMLSpanElement>` を継承する。

**共通スタイル**: `rounded-sm`、`font-mono text-[10px]`、`tracking-widest`、`font-bold`

**forwardRef**: 未使用。表示専用で外部から DOM を触る必要がないため（判断基準は `03-forward-ref.md` §2.2）。

### 2.6 ThemeToggle

**ファイル**: `src/components/atoms/ThemeToggle.tsx`

**Props**: なし。**依存フック**: `useTheme`（`src/hooks/useTheme.ts`）

配色テーマ（ライト / ダーク）を切り替える。`'use client'` を持つ唯一の Atom。

**選択中かどうかの表示は JS ではなく CSS が決める。** サーバーは Cookie 未設定時に `data-theme` を
出力せず OS 設定へ委ねるため、選択状態を React の state で持つと**初期描画時点では正解が分からず**、
ハイドレーション不一致か一瞬のちらつきのどちらかが必ず起きる。`globals.css` の `.theme-toggle-light` /
`.theme-toggle-dark` を配色トークンと同じ 4 ブロックのカスケード（既定 → `prefers-color-scheme` →
`[data-theme='light']` → `[data-theme='dark']`）で切り替えれば、その問題自体が消える。

**トグル 1 個ではなくボタン 2 個。** 1 個にすると「いまどちらか」を `aria-pressed` で伝える必要があり、
上と同じ理由で初期値を決められない。2 個なら各ボタンは単なる操作であり、状態属性を持たなくてよい。

| 要素 | アクセシビリティ |
|------|----------------|
| 外枠 | `role="group"` / `aria-label="配色テーマ"` |
| ライトボタン | `aria-label="ライトテーマに切り替える"` |
| ダークボタン | `aria-label="ダークテーマに切り替える"` |
| 記号（○ / ●） | `aria-hidden="true"`（装飾のため読み上げを汚さない） |

**DOM と Cookie への書き込みは `useTheme` が持つ。** このコンポーネントは描画と `onClick` の
割り当てに専念する（issue #144）。`useTheme` は**状態を返さない** — 返しても初期描画時点で
正解が決まらないため。

**forwardRef**: 未使用。`cn()` も使用しない（クラスが静的なため）。

---

## 3. Molecules（分子コンポーネント）

Molecules は **Atoms や基本要素を組み合わせた複合コンポーネント** である。独自の状態管理は持たず、Props 経由でデータを受け取り表示する。

### 3.1 CareerCard

**ファイル**: `src/components/molecules/CareerCard.tsx`

**依存 Atom**: `Badge`（進行中の印）
**依存ロジック**: `groupTechStack`（`src/lib/group-tech-stack.ts`）

| Props | 型 | 説明 |
|-------|-----|------|
| `title` | `string` | プロジェクトタイトル |
| `period` | `string` | 期間（呼び出し側で整形済み） |
| `teamSize` | `string` | チーム規模 |
| `description` | `string` | 説明 |
| `techStack` | `string[]` | 技術スタック（分類ごとにまとめて表示） |
| `phases` | `string[]` | 担当フェーズ |
| `role` | `string` | 役割 |
| `isCurrent` | `boolean?` | 現在進行中フラグ（既定 `false`） |
| `className` | `string?` | 追加クラス |

**構造**:

```text
CareerCard (<article> + 左罫 2px)
├── タイトル（h3）
│   └── 「現在」Badge（isCurrent=true 時のみ）
├── 期間 ・ チーム規模（等幅 1 行）
├── 説明文
├── 技術スタック（<dl>: 分類ラベル + チップ。中身のある分類のみ描画）
├── 担当フェーズ（中黒区切りの 1 行。空なら節ごと描画しない）
└── 役割
```

**ルート要素は `<div>` ではなく `<article>`。** 経歴 1 件は独立して意味を持つ内容のため。

**進行中と過去で重みを変える**（issue #135 の弱点(4)）:

| 状態 | 左罫 | 補足 |
|------|------|------|
| 進行中（`career_end === 'now'`） | `border-acc` | タイトル横に「現在」Badge |
| 過去 | `border-rule` | バッジなし |

全 7 件が等価に並ぶと、直近の案件と 2015 年の業務が同じ重さで読まれてしまう。

**技術スタックの表示**:

- 1 案件あたり最大 30 件をフラットに並べると、読み手が信号（言語・フレームワーク・テスト）と
  ノイズ（協働ツール）を自力で分離するほかなかった。`groupTechStack` で 9 区分へ束ねる（issue #137）
- 技術名は読点で連ねず 1 件ずつチップにする。読点区切りは「文章」として読まれ、個々の技術を拾い読みできない
- チップは等幅にしない。`C言語` `グラフィックMW` のように日本語を含む技術名があり、等幅フォントに
  グリフが無いと字形が混ざるため
- チップは枠線ではなく地色（`--panel`）で塗る。30 個並んだときに線が主張しすぎるため

**ホバーエフェクトは持たない。** 旧デザインの浮き上がり（`floating-card`）・発光テキスト
（`group-hover:neon-text`）・下部ラインの伸長はいずれも廃止した。拡大・浮き上がり・影の増減は
書類として読ませる設計に馴染まない（`docs/03-functional-specification.md` §5.7）。

**各項目のラベル（「技術スタック」「担当フェーズ」「役割」）はハードコードされており**、GCS の
`career_title_data` は参照していない（詳細は `docs/05-data-specification.md` §2.6）。

### 3.2 ProductCard

**ファイル**: `src/components/molecules/ProductCard.tsx`

**依存 Atom**: なし（`Badge` も使わない）

| Props | 型 | 説明 |
|-------|-----|------|
| `title` | `string` | プロダクト名 |
| `description` | `string` | 概要説明 |
| `siteUrl` | `string` | 公開サイト URL。空文字ならリンクを描画しない |
| `repoUrl` | `string` | リポジトリ URL。空文字ならリンクを描画しない |
| `techStack` | `string[]` | 使用技術。分類せずそのまま並べる |
| `className` | `string?` | 追加クラス |

**構造**:

```text
ProductCard (<article> + 左罫 2px)
├── プロダクト名（h3）
├── 概要説明
├── 技術スタック（チップ。空なら見出しごと描画しない）
└── リンク（site / repo。両方空なら行ごと描画しない）
```

**`CareerCard` と同じ体裁で組む。** 経歴とプロダクトは「何を作ったか」を示す点で並びの性格が
同じであり、別の見せ方にすると読み手が切り替えを強いられる。

**`CareerCard` と違う 3 点:**

| 項目 | ProductCard | 理由 |
|------|-------------|------|
| 進行中バッジ | 持たない | 個人開発は「いま動いているか」より「何を作ったか」が主題。掲載順で意図を表せる |
| 技術スタックの分類 | しない（フラットなチップ） | `groupTechStack` は 1 案件 30 件を捌く仕組み。数件では分類ラベルの方が場所を取る |
| 左罫の色 | 常に `--rule` | 色分けする軸（進行中 / 過去）を持たないため |

**リンクの出し分け**: `site` / `repo` は URL が空文字、**および空白のみ**なら描画しない。
GCS の JSON は手書きのため、消したつもりのフィールドに空白が残りうる。空白を URL として
扱うと、押しても何も起きないリンクが画面に出る。

ラベルは `site` / `repo` の 2 語しかなく複数のカードに同じ文字が並ぶため、`aria-label` に
プロダクト名を含める（`{プロダクト名}のサイトを開く`）。リンク文字だけではどのプロダクトの
ものか伝わらないため。

**スクリーンショットは表示しない。** `next.config.js` が `images: { unoptimized: true }` のため
画像最適化が効かず原寸で配信される。判断の詳細は `docs/05-data-specification.md` §2.9。

### 3.3 ArticleEntry

**ファイル**: `src/components/molecules/ArticleEntry.tsx`

**依存 Atom**: なし

| Props | 型 | 説明 |
|-------|-----|------|
| `title` | `string` | 記事タイトル。リンクの可視テキストになる |
| `url` | `string` | 記事の URL。空文字ならリンクにしない |
| `platform` | `string` | 掲載媒体（例: `Zenn`） |
| `publishedAt` | `string` | 公開年月（`YYYY年M月`） |
| `description` | `string` | 記事の概要 |
| `className` | `string?` | 追加クラス |

**構造**:

```text
ArticleEntry (<article> + 下罫)
├── タイトル（h3・外部リンク） ─── 媒体 ・ 公開年月（等幅・右端）
└── 概要
```

**カードではなく「行」で組む唯一の molecule。** `CareerCard` / `ProductCard` は左罫のカードだが、
記事は件数が増えやすく 1 件あたりの情報量も小さい。同じカードにすると縦に間延びし、一覧として
流し読みできなくなる。**同じ体裁を使うかどうかは「並びの性格」で決める**（`ProductCard` が
`CareerCard` に揃えたのは、どちらも「作ったもの」を示す並びだったため）。

**`aria-label` を付けない。** `ProductCard` の `site` / `repo` はラベルが非記述的なためアクセシブル名を
補ったが、記事タイトルはそれ自体が行き先を説明している。`aria-label` を足すと可視テキストを
上書きすることになり、読み上げと見た目がずれるだけで利得がない。**補うべきは非記述的なラベルだけ。**

**欠損したフィールドは中黒ごと落とす。** GCS の JSON は手書きのため、媒体や公開年月が空のまま
入りうる。素朴に `${platform} ・ ${publishedAt}` と組むと `・ 2024年5月` のように行き場のない
区切り記号が残る。値のある分だけを中黒で連結する。

**URL が空ならリンクにしない。** `<a href="">` は現在のページ自身を指すため、押すとページが
再読み込みされる。「押せるのに何も起きない」より、押せない方が誤解が少ない。

### 3.4 SocialLinks

**ファイル**: `src/components/molecules/SocialLinks.tsx`

**依存**: `SNSItem` 型（`@/types/portfolio`）

| Props | 型 | 説明 |
|-------|-----|------|
| `links` | `SNSItem[]` | SNSリンクデータ配列。並び順がそのまま描画順 |
| `className` | `string?` | 追加クラス |

**アイコン画像ではなく `sns_name` のテキストチップで表示する。** `sns_img` が指す GCS 上の SVG は
白一色（`github_original_white.svg` 等）で、紙のような明るい地の上では見えなくなる。データは
変更しない方針（issue #135）のため、明るい地でも読める表現へ置き換えた。CSS フィルタで反転させる手も
あるが、将来データ側が色付きアイコンに差し替わると破綻する。

その結果 **`next/image` への依存と `size` Props は廃止**され、`sns_img` は画面から参照されなくなった
（`career_title_data` / `contact_data` と同じ状態）。表示は `sns_name` をそのまま使う。データ上は
小文字（`github` / `zenn`）だが、等幅で組むと表記として成立するため大文字化などの加工はしない。

**セキュリティ対策**:

- 全外部リンクに `target="_blank"` + `rel="noopener noreferrer"` を適用
- `aria-label` に「{SNS名}のプロフィールを開く」を設定（リンク文字だけでは行き先が伝わりにくいため）

**ホバー**: 枠線を `--rule` から `--field` へ、文字色を `--mute` から `--ink` へ。拡大やオーバーレイは使わない。

---

## 4. Organisms（生体コンポーネント）

Organisms は **独自の状態管理・イベント処理・API通信を持つ** 複合的な機能コンポーネントである。

### 4.1 Header

**ファイル**: `src/components/organisms/Header.tsx`

**依存 Atom**: `ThemeToggle`

| Props | 型 | 説明 |
|-------|-----|------|
| `navItems` | `Array<{name: string, href: string}>` | ナビゲーション項目 |
| `logo` | `string` | ロゴテキスト |

**内部状態**:

| State | 型 | 用途 |
|-------|-----|------|
| `isMobileMenuOpen` | `boolean` | モバイルメニューの開閉制御 |

**スクロール追従をやめ、地の流れに置いた。** 旧デザインは `fixed` ヘッダーにガラス調の背景を敷き、
`useEffect` でスクロール量を監視して見た目を切り替えていた。書類として読ませる設計では本文に被る
要素が邪魔になるため、`border-b border-rule` で区切るだけの通常フローに変えた。

これに伴い **`isScrolled` 状態・`scroll` イベントリスナー・条件分岐する `cn()` 3 箇所が消えた**。
現在 `cn()` は 1 箇所（モバイルメニューの静的クラス）のみで、条件分岐を含まない。

**ナビは `<button>` のまま維持している。** `e2e/home.spec.ts` と `e2e/security.spec.ts` が
`getByRole('button', { name: 'Contact' })` でハイドレーション完了を確認しており、`<a>` へ変えると
JS を実行しなくても遷移してしまい、確認の意味が失われる（issue #131 で一度壊した箇所）。

**デスクトップナビは 6 項目前提で組んでいる。** 掲載セクションの追加（#127〜#129）で 3 → 6 に
倍増しても収まる幅を確認済み（issue #135）。

**forwardRef**: 未使用。内部で状態管理を完結しており、外部から DOM を触る必要がない。

### 4.2 ContactForm

**ファイル**: `src/components/organisms/ContactForm.tsx`

**依存 Atom**: `Button`, `Input`, `TextArea`

**内部状態**:

| State | 型 | 用途 |
|-------|-----|------|
| `isSubmitting` | `boolean` | 送信中状態 |
| `isSubmitted` | `boolean` | 送信完了状態 |
| `submitError` | `string \| null` | エラーメッセージ |
| React Hook Form | `useForm<ContactFormInput>` | フォーム入力値・バリデーション状態 |

**フォーム管理**: React Hook Form + Zod（`@hookform/resolvers/zod`）

```typescript
const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormInput>({
    resolver: zodResolver(ContactFormSchema),
});
```

**Atoms との統合**: `register()` が返す `ref` を Atom の `forwardRef` 経由で DOM 要素に渡す。

```tsx
<Input
    label="お名前"
    required
    {...register('name')}    // ← register() の戻り値（ref 含む）を展開
    error={errors.name?.message}
/>
```

この統合が成立するために、Input / TextArea / Button の各 Atom が `React.forwardRef` を使用している。

**送信結果の通知**: 完了画面はフォームと差し替わるため `role="status"`（polite 相当）、送信エラーは
利用者の対応を要するため `role="alert"`（assertive 相当）を使い分ける。各フィールドのエラーは
Input / TextArea 側の `aria-describedby` / `aria-invalid` が担う。

**画面遷移（3状態）**:

```text
[フォーム表示] → 送信 → [送信中（ローディング）] → 成功 → [送信完了画面]
                                                  → 失敗 → [エラー表示 + フォーム]
```

> **既知の逸脱**: `fetch('/api/contact')` をコンポーネント内から直接呼んでいる。`frontend.md` は
> 「`fetch` を書いてよいのは `repositories/` だけ」「クライアントコンポーネントのロジックは
> カスタムフックへ切り出す」と定めており、現状はいずれにも従っていない。送信処理を差し替える際は
> 呼び出し口がここ 1 箇所であることに注意。

**forwardRef**: 未使用。Atoms に ref を渡す側であるため。

---

## 5. ページレベルの組み立て

トップページは **server-first** で組む。`src/app/page.tsx` が Server Component としてデータを取得し、
描画と対話を `src/app/client.tsx` の `HomeClient` へ委譲する。

以前はページ全体が Client Component で `useEffect` から `/api/portfolio` を fetch していたため、
初期 HTML にはローディングスピナーしか出力されていなかった（JS を実行しない SNS のクローラからは
本文が一切見えない状態だった）。

### 5.1 コンポーネント依存ツリー

```text
page.tsx（Server Component / force-dynamic）
└── HomeClient（client.tsx）
    ├── Header (organism) ← portfolioData.navbar_data から navItems を生成
    │   └── ThemeToggle (atom)
    ├── Hero Section（直接実装）
    │   └── about_contents[1] の引用パネル + summarizeCareers の数値帯
    ├── About Section（直接実装）
    │   ├── next/image ← about_data.about_img_url
    │   └── SocialLinks (molecule) ← about_data.sns_list
    ├── Career Section（直接実装）
    │   └── CareerCard (molecule) × N件
    │       └── Badge (atom) ← 進行中の案件のみ
    ├── Product Section（直接実装）
    │   └── ProductCard (molecule) × N件
    ├── Articles Section（直接実装）
    │   └── ArticleEntry (molecule) × N件
    ├── Contact Section（直接実装）
    │   └── ContactForm (organism)
    │       ├── Input (atom) × 2 ← 名前・メール入力
    │       ├── TextArea (atom) ← メッセージ入力
    │       └── Button (atom) × 2 ← 送信ボタン / 送信完了画面の「新しいお問い合わせ」
    └── Footer（直接実装）
```

**Hero に Button は無い。** 旧デザインの「お問い合わせ」CTA は issue #138 で削除した。書類として
読ませる設計にマーケ的な CTA が馴染まず、Contact へはヘッダーと末尾の 2 箇所から到達できるため。

### 5.2 状態管理

| コンポーネント | 状態 | 備考 |
|---------------|------|------|
| `page.tsx` | なし | `async` でデータを取得し props へ渡すだけ |
| `HomeClient` | なし | `'use client'` は子（Header / ContactForm / ThemeToggle）を配置するために維持している |
| `Header` | `isMobileMenuOpen` | |
| `ContactForm` | `isSubmitting` / `isSubmitted` / `submitError` + `useForm` | |
| `ThemeToggle` | なし | `useTheme` は状態を返さない（§2.6） |

**データ取得の状態（`loading` / `portfolioData`）はどこにも無い。** server-first への移行で
クライアント側の取得処理ごと消えたため。

### 5.3 Atomic Design の階層関係

```text
┌─────────────────────────────────────────────────────┐
│              Page (page.tsx / client.tsx)            │
│    Server: データ取得 / Client: セクションレイアウト     │
├─────────────────────────────────────────────────────┤
│              Organisms（独立機能単位）                 │
│    Header: ナビゲーション + モバイルメニュー            │
│    ContactForm: フォーム管理 + API通信                │
├─────────────────────────────────────────────────────┤
│              Molecules（複合表示部品）                 │
│    CareerCard: 分類チップ + Badge で経歴を表示          │
│    ProductCard: 個人開発プロダクトを表示               │
│    ArticleEntry: 執筆記事を罫線区切りの行で表示        │
│    SocialLinks: テキストチップでSNSリンク一覧           │
├─────────────────────────────────────────────────────┤
│               Atoms（最小UIパーツ）                   │
│    Button / Input / TextArea / Badge / ThemeToggle   │
│    → forwardRef / cn() / variant パターン            │
└─────────────────────────────────────────────────────┘
```

---

## 6. 設計上の特徴と考察

### 6.1 採用しているパターン

| パターン | 実装箇所 | 効果 |
|---------|---------|------|
| **バリアントマップ** | Button, Badge | `if/else` の乱立を防ぎ、バリアント追加を容易にする |
| **サイズマップ** | Button | サイズごとのスタイル定義を一箇所に集約 |
| **条件付き cn()** | Input, TextArea | エラー状態に応じたスタイル切替を宣言的に記述 |
| **Props スプレッド** | Button, Input, TextArea, Badge | `{...props}` で HTML ネイティブ属性をすべて透過 |
| **displayName** | forwardRef 使用 Atoms | React DevTools でのデバッグ容易性を確保 |
| **配色トークン** | 全コンポーネント | 固定色を書かず `bg-acc` / `text-ink` 等を使い、テーマ切替を CSS 側へ寄せる |
| **ロジックのフック切り出し** | ThemeToggle → `useTheme` | DOM / Cookie 操作をコンポーネントから分離（issue #144） |

> **廃止したパターン**: グループホバー（`CareerCard` の `group-hover:`）、サイズマップの
> Badge / SocialLinks への適用、`Header` のスクロール状態による条件付き `cn()`。
> いずれもデザイン刷新（#138）で対象の実装ごと無くなった。

### 6.2 階層間の責務分離

| 階層 | 責務 | 状態管理 | 外部通信 |
|------|------|---------|---------|
| Atoms | 単一要素のスタイル・インタラクション | なし（ThemeToggle も持たない） | なし |
| Molecules | 複数要素の組み合わせ表示 | なし | なし |
| Organisms | 機能ロジック（フォーム、ナビ） | あり（useState） | あり（ContactForm のみ） |
| Page (client.tsx) | 全体レイアウト | なし | なし |
| Page (page.tsx) | データ取得 | なし | あり（`repositories/` 経由） |

この分離により、Atoms / Molecules はステートレスで再利用性が高く、**外部 I/O は `page.tsx` の
`repositories/` 呼び出しと `ContactForm` の送信の 2 箇所に閉じている**。
