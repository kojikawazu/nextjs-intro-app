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
    - [3.4 SectionHeading](#34-sectionheading)
    - [3.5 SocialLinks](#35-sociallinks)
    - [3.6 AiPracticeEntry](#36-aipracticeentry)
- [4. Organisms（生体コンポーネント）](#4-organisms生体コンポーネント)
    - [4.1 Organisms の定義](#41-organisms-の定義)
    - [4.2 Header](#42-header)
    - [4.3 ContactForm](#43-contactform)
    - [4.4 セクション organisms](#44-セクション-organisms)
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
├── molecules/      ← Atoms を組み合わせた複合コンポーネント（6コンポーネント）
│   ├── AiPracticeEntry.tsx
│   ├── ArticleEntry.tsx
│   ├── CareerCard.tsx
│   ├── ProductCard.tsx
│   ├── SectionHeading.tsx
│   └── SocialLinks.tsx
└── organisms/      ← インターフェース上の独立した区画（10コンポーネント）
    ├── AboutSection.tsx
    ├── AiUsageSection.tsx
    ├── ArticlesSection.tsx
    ├── CareerSection.tsx
    ├── ContactForm.tsx
    ├── ContactSection.tsx
    ├── Header.tsx
    ├── HeroSection.tsx
    ├── ProductSection.tsx
    └── SiteFooter.tsx
```

**ロジックは階層の外に置く。** クライアントコンポーネントの振る舞い（DOM 操作・保存など）は
`src/hooks/` のカスタムフックへ切り出し、`components/` 配下は描画と操作の割り当てに専念させる
（`frontend.md`「クライアントコンポーネントのロジックはカスタムフックに切り出す」）。
現在は `useTheme`（`ThemeToggle` が使用）の 1 件。

> organisms は issue #153 で 2 件 → 9 件になり、issue #129 の `AiUsageSection` で 10 件になった。それまで 7 つのセクションは
> `client.tsx` にインラインで実装されており（296 行）、Atomic Design の階層に載っていなかった。
> molecules は issue #128 の `ProductCard`、issue #127 の `ArticleEntry`、issue #153 の
> `SectionHeading` 追加で 5 件、issue #129 の `AiPracticeEntry` で 6 件になった。
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

**カードではなく「行」で組む molecule**（issue #129 の `AiPracticeEntry` も同じ体裁、§3.6）。 `CareerCard` / `ProductCard` は左罫のカードだが、
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

### 3.4 SectionHeading

**ファイル**: `src/components/molecules/SectionHeading.tsx`

**依存 Atom**: なし

| Props | 型 | 説明 |
|-------|-----|------|
| `title` | `string` | セクションの見出し文字列 |
| `count` | `number?` | 右端に出す件数。`undefined` なら描画しない |

issue #153 で抽出した。About / Career / Product / Articles / Contact の **5 箇所**が同じ
マークアップ（`h2` + 罫線 + 件数）を繰り返しており、見出しの体裁を変えるたびに 5 箇所を
直す必要があった。

**この罫線がセクションの区切りを兼ねる**（`globals.css` の `.section-heading`）。`<section>` 側に
`border-t` を足すと、余白を挟んで横罫が 2 本並び、どちらが区切りなのか読めなくなる。

**件数は「0 件のときに 0 を出す」。** `count` を渡すかどうかで出し分ける設計にしてあり、
件数の概念があるセクション（Career / Product / Articles）では 0 件でも `0` と出る。
件数の概念が無いセクション（About / AI / Contact）は `count` を渡さない。
`count && ...` のように falsy で握りつぶすと、**「0 件」と「件数の概念が無い」が区別できなくなる**。

### 3.5 SocialLinks

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

### 3.6 AiPracticeEntry

**ファイル**: `src/components/molecules/AiPracticeEntry.tsx`

**依存 Atom**: なし

| Props | 型 | 説明 |
|-------|-----|------|
| `title` | `string` | 方針の見出し |
| `description` | `string` | 方針の要約（1 文）。空なら段落を描画しない |
| `className` | `string?` | 追加クラス |

**構造**:

```text
AiPracticeEntry (<article> + 下罫)
├── 見出し（h3）
└── 要約
```

**`ArticleEntry` と同じ「行」で組む。** 1 件が見出しと 1 文だけで、`CareerCard` / `ProductCard` の
左罫カードにすると中身に対して枠が勝ち、縦に間延びする。§3.3 の「同じ体裁を使うかどうかは並びの
性格で決める」に従えば、これは「実績」ではなく「流し読みする要約の一覧」であり、記事の行と性格が近い。

**リンクを持たない。** 詳細ページへの導線はセクションに 1 本だけ置き（`AiUsageSection`）、方針ごとには
張らない。解説ページ側の構成が変わるたびに方針ごとのアンカーを追随させる必要が出るため。

**要約が空なら段落を描画しない**（空白のみも同様）。GCS の JSON は手書きのため、見出しだけを先に
入れた状態がありうる。

---

## 4. Organisms（生体コンポーネント）

### 4.1 Organisms の定義

Organisms は **molecules や atoms を組み合わせた、インターフェース上の比較的複雑で独立した区画**である。

> **issue #153 で定義を改めた。** それまで本ドキュメントは「Organisms は**独自の状態管理・
> イベント処理・API 通信を持つ**複合的な機能コンポーネント」と定義していた。しかし Atomic Design
> （Brad Frost）の定義に**状態の有無は含まれない**。当時 organisms が `Header` と `ContactForm`
> （どちらも状態を持つ）しか無かったため、**カテゴリではなく当時の実例を記述してしまっていた**。
>
> この定義のままでは、状態を持たないセクションを organisms へ置く説明がつかず、結果として
> 7 つのセクションが `client.tsx` にインラインで残り続けていた。**定義が実装の形を縛っていた**例である。

現在の organisms は 2 系統ある。

| 系統 | コンポーネント | 状態 |
|------|--------------|------|
| **機能単位** | `Header` / `ContactForm` | あり |
| **セクション** | `HeroSection` / `AboutSection` / `CareerSection` / `AiUsageSection` / `ProductSection` / `ArticlesSection` / `ContactSection` / `SiteFooter` | なし |

どちらも「独立した区画」である点で同じカテゴリに属する。

### 4.2 Header

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

### 4.3 ContactForm

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

### 4.4 セクション organisms

issue #153 で `client.tsx` から切り出した 7 つと、issue #129 で追加した `AiUsageSection` の 8 つ。
**いずれも状態を持たず**、渡されたデータを描画するだけである。

| コンポーネント | アンカー | 依存 | 主な判断 |
|--------------|---------|------|---------|
| `HeroSection` | （なし） | — | リードが無ければ引用パネルごと落とす。`startYear` が `null` なら `—` |
| `AboutSection` | `#about` | `SectionHeading` / `SocialLinks` / `next/image` | 氏名は画像の `alt` にのみ使う |
| `CareerSection` | `#career` | `SectionHeading` / `CareerCard` / `formatCareerPeriod` | `career_end === 'now'` の解釈。**並べ替えない** |
| `AiUsageSection` | `#ai-usage` | `SectionHeading` / `AiPracticeEntry` | **件数を出さない**。詳細 URL が空ならリンクを描画しない |
| `ProductSection` | `#product` | `SectionHeading` / `ProductCard` | — |
| `ArticlesSection` | `#articles` | `SectionHeading` / `ArticleEntry` | カード間の `gap` を持たない（行として連続させる） |
| `ContactSection` | `#contact` | `SectionHeading` / `ContactForm` | — |
| `SiteFooter` | （なし） | — | 見出しを持たないため自前で上罫を引く |

**`HeroSection` だけ `id` を持たない。** ナビゲーションの遷移先にならず、ページ先頭そのものが
ヒーローの位置になるため。

**`ContactSection` は organism が organism を含む形になる。** Atomic Design は階層の入れ子を
禁じておらず、`ContactSection` は「セクションという区画」、`ContactForm` は「フォームという
機能単位」で関心が違う。セクション側はフォームの状態を一切知らない。

**`'now'` の解釈を `CareerCard` に持たせない。** `'now'` は GCS のデータ形式に属する約束であり、
表示部品が知るべきことではない。`CareerSection` が `isCurrent: boolean` へ翻訳して渡す。

**命名は `SiteFooter`**（`Footer` ではない）。`<footer>` 要素や将来のセクション内フッターと
取り違えないため。

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
└── HomeClient（client.tsx）… 合成ルート。マークアップを持たない
    ├── Header (organism)
    │   └── ThemeToggle (atom) → useTheme (hooks)
    ├── HeroSection (organism)
    ├── AboutSection (organism)
    │   ├── SectionHeading (molecule)
    │   ├── SocialLinks (molecule)
    │   └── next/image
    ├── CareerSection (organism)
    │   ├── SectionHeading (molecule)
    │   ├── CareerCard (molecule) × N件
    │   │   ├── Badge (atom) ← 進行中の案件のみ
    │   │   └── groupTechStack (lib)
    │   └── formatCareerPeriod (lib)
    ├── AiUsageSection (organism)
    │   ├── SectionHeading (molecule)
    │   └── AiPracticeEntry (molecule) × N件
    ├── ProductSection (organism)
    │   ├── SectionHeading (molecule)
    │   └── ProductCard (molecule) × N件
    ├── ArticlesSection (organism)
    │   ├── SectionHeading (molecule)
    │   └── ArticleEntry (molecule) × N件
    ├── ContactSection (organism)
    │   ├── SectionHeading (molecule)
    │   └── ContactForm (organism)
    │       ├── Input (atom) × 2
    │       ├── TextArea (atom)
    │       └── Button (atom) × 2
    └── SiteFooter (organism)
```

`HomeClient` が呼ぶ lib は `summarizeCareers`（Hero の数値帯）と `splitAboutContents`
（`about_contents` の再配置）の 2 つ。**どちらも「どのデータをどのセクションへ渡すか」を
決める処理**であり、合成ルートの責務に属する。

**Hero に Button は無い。** 旧デザインの「お問い合わせ」CTA は issue #138 で削除した。書類として
読ませる設計にマーケ的な CTA が馴染まず、Contact へはヘッダーと末尾の 2 箇所から到達できるため。

### 5.2 状態管理

| コンポーネント | 状態 | 備考 |
|---------------|------|------|
| `page.tsx` | なし | `async` でデータを取得し props へ渡すだけ |
| `HomeClient` | なし | `'use client'` は子（Header / ContactForm / ThemeToggle）を配置するために維持している |
| セクション organisms 8 件 | なし | 渡されたデータを描画するだけ |
| `Header` | `isMobileMenuOpen` | |
| `ContactForm` | `isSubmitting` / `isSubmitted` / `submitError` + `useForm` | |
| `ThemeToggle` | なし | `useTheme` は状態を返さない（§2.6） |

**データ取得の状態（`loading` / `portfolioData`）はどこにも無い。** server-first への移行で
クライアント側の取得処理ごと消えたため。

### 5.3 Atomic Design の階層関係

```text
┌─────────────────────────────────────────────────────┐
│              Page (page.tsx / client.tsx)            │
│    Server: データ取得 / Client: セクションの合成         │
├─────────────────────────────────────────────────────┤
│            Organisms（独立した区画）                   │
│    Header: ナビゲーション + モバイルメニュー            │
│    ContactForm: フォーム管理 + API通信                │
│    〜Section 7 件 + SiteFooter: 各セクションの区画       │
├─────────────────────────────────────────────────────┤
│              Molecules（複合表示部品）                 │
│    CareerCard: 分類チップ + Badge で経歴を表示          │
│    ProductCard: 個人開発プロダクトを表示               │
│    ArticleEntry: 執筆記事を罫線区切りの行で表示        │
│    AiPracticeEntry: AI 活用の方針を罫線区切りの行で表示 │
│    SectionHeading: 見出し + 罫線 + 件数                │
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
| **ロジックの lib 切り出し** | CareerSection → `formatCareerPeriod` / HomeClient → `splitAboutContents` | コンポーネント内の private 関数はユニットテストが当たらない。`lib/` へ出すと単体で検証できる（issue #153） |
| **合成ルート** | `client.tsx` | マークアップを持たず、どのセクションへどのデータを渡すかだけを決める。セクションが増えても行数が線形に増えない（issue #153） |

> **廃止したパターン**: グループホバー（`CareerCard` の `group-hover:`）、サイズマップの
> Badge / SocialLinks への適用、`Header` のスクロール状態による条件付き `cn()`。
> いずれもデザイン刷新（#138）で対象の実装ごと無くなった。

### 6.2 階層間の責務分離

| 階層 | 責務 | 状態管理 | 外部通信 |
|------|------|---------|---------|
| Atoms | 単一要素のスタイル・インタラクション | なし（ThemeToggle も持たない） | なし |
| Molecules | 複数要素の組み合わせ表示 | なし | なし |
| Organisms | 独立した区画（セクション・フォーム・ナビ） | 機能単位のみあり（useState） | あり（ContactForm のみ） |
| Page (client.tsx) | セクションの合成とデータの振り分け | なし | なし |
| Page (page.tsx) | データ取得 | なし | あり（`repositories/` 経由） |

この分離により、Atoms / Molecules はステートレスで再利用性が高く、**外部 I/O は `page.tsx` の
`repositories/` 呼び出しと `ContactForm` の送信の 2 箇所に閉じている**。
