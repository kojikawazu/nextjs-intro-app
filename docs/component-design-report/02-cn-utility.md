# cn() ユーティリティ設計レポート

| 項目 | 内容 |
|------|------|
| プロジェクト名 | TechProfile Pro |
| ドキュメント種別 | cn() ユーティリティ設計レポート |
| 作成日 | 2026-03-20 |
| 最終更新 | 2026-09-22（issue #147） |

> **2026-09-22 改訂。** デザイン刷新（issue #136 / #137 / #138）で呼び出し箇所が
> 11 → 7 に減り、コード例の前提だった旧クラス（`glass-card` / `neon-text` 等）も無くなった。
> 実装へ同期している（issue #147）。

---

## 目次

- [1. cn() の定義と役割](#1-cn-の定義と役割)
    - [1.1 ソースコード](#11-ソースコード)
    - [1.2 処理の流れ](#12-処理の流れ)
    - [1.3 2つのライブラリの役割分担](#13-2つのライブラリの役割分担)
- [2. 使用パターン一覧](#2-使用パターン一覧)
    - [2.1 全使用箇所](#21-全使用箇所)
    - [2.2 パターン別分類](#22-パターン別分類)
        - [パターン A: バリアント + サイズ + className 結合](#パターン-a-バリアント--サイズ--classname-結合)
        - [パターン B: 条件分岐によるスタイル切替](#パターン-b-条件分岐によるスタイル切替)
        - [パターン C: 固定ベース + className 透過](#パターン-c-固定ベース--classname-透過)
    - [2.3 cn() を使っていない箇所](#23-cn-を使っていない箇所)
- [3. cn() がない場合の比較](#3-cn-がない場合の比較)
    - [3.1 素の className 結合との比較](#31-素の-classname-結合との比較)
    - [3.2 cn() の利点まとめ](#32-cn-の利点まとめ)
- [4. className Props の設計意図](#4-classname-props-の設計意図)

---

## 1. cn() の定義と役割

### 1.1 ソースコード

**ファイル**: `src/utils/cn.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

### 1.2 処理の流れ

```text
入力: cn('border px-3', hasError && 'border-warn', className)
        │
        ▼
    clsx(inputs)
    ・falsy 値（false, null, undefined）を除去
    ・配列・オブジェクトを展開
    ・有効なクラス名を半角スペースで結合
        │
        ▼
    twMerge(result)
    ・Tailwind CSS クラスの競合を検出・解決
    ・例: 'px-4 px-6' → 'px-6'（後勝ち）
    ・例: 'border-field border-warn' → 'border-warn'（後勝ち）
        │
        ▼
出力: 最終的なクラス名文字列
```

### 1.3 2つのライブラリの役割分担

| ライブラリ | 役割 | 解決する問題 |
|-----------|------|-------------|
| **clsx** | 条件付きクラス名の結合 | `false && 'hidden'` のような条件式を安全に処理 |
| **tailwind-merge** | Tailwind クラスの競合解決 | `'px-4 px-6'` で `px-4` が残ってしまう問題を解決 |

**clsx だけでは不十分な例**:

```typescript
// clsx のみ
clsx('px-4', 'px-6')  // → 'px-4 px-6'（両方残る → CSS 詳細度の問題）

// cn() (clsx + tailwind-merge)
cn('px-4', 'px-6')    // → 'px-6'（後のクラスが優先される）
```

---

## 2. 使用パターン一覧

### 2.1 全使用箇所

| ファイル | cn() 呼び出し数 | 主な用途 |
|---------|----------------|---------|
| `atoms/Button.tsx` | 1 | ベース + バリアント + サイズ + 条件 + className |
| `atoms/Input.tsx` | 1 | ベース + エラー状態条件 + className |
| `atoms/TextArea.tsx` | 1 | ベース + エラー状態条件 + className |
| `atoms/Badge.tsx` | 1 | ベース + バリアント + className |
| `molecules/CareerCard.tsx` | 1 | ベース + 進行中条件 + className |
| `molecules/SocialLinks.tsx` | 1 | ベース + className |
| `organisms/Header.tsx` | 1 | 固定クラスのみ（§2.3 参照） |
| **合計** | **7** | |

> 旧デザインでは 11 箇所だった。`SocialLinks` のサイズ切替（1 箇所）と `Header` の
> スクロール状態による切替（3 箇所）が、デザイン刷新（issue #138）で実装ごと無くなったため。

### 2.2 パターン別分類

#### パターン A: バリアント + サイズ + className 結合

**使用箇所**: Button, Badge

```typescript
// Button.tsx
cn(
    'inline-flex items-center justify-center rounded-sm font-bold tracking-wide transition-opacity',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANT_CLASSES[variant],   // → 'bg-acc text-acc-on hover:opacity-90'
    SIZE_CLASSES[size],         // → 'h-10 px-5 text-sm'
    isLoading && 'cursor-not-allowed',
    className,
)
```

**構造**:

```text
cn(
    固定ベーススタイル,        // 'rounded-sm font-bold ...'
    VARIANT_CLASSES[値],      // バリアントマップ
    SIZE_CLASSES[値],         // サイズマップ（Button のみ。Badge に size は無い）
    条件付きクラス,            // isLoading && 'cursor-not-allowed'
    外部からの className       // 親コンポーネントによるカスタマイズ
)
```

**特徴**: オブジェクトマップでバリアントとサイズを管理し、`cn()` で結合する。新しいバリアント追加はマップに1行追加するだけで完了する。マップは `Record<NonNullable<ButtonProps['variant']>, string>` で型付けしてあるため、**型に追加してマップへ足し忘れると型エラーで止まる**。

#### パターン B: 条件分岐によるスタイル切替

**使用箇所**: Input, TextArea, CareerCard

```typescript
// Input.tsx — エラー状態で枠線とフォーカスリングを切り替える
cn(
    'block w-full rounded-sm border bg-panel px-3 py-2.5 text-sm text-ink',
    'placeholder:text-mute',
    'focus:outline-none focus:ring-2 focus:ring-acc focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50',
    hasError ? 'border-warn focus:ring-warn' : 'border-field',
    className,
)

// CareerCard.tsx — 進行中の案件だけ左罫をアクセント色にする
cn('border-l-2 pl-5', isCurrent ? 'border-acc' : 'border-rule', className)
```

**特徴**: 三項演算子で状態に応じたスタイルセットを丸ごと切り替える。`clsx` の条件処理と `twMerge` のクラス競合解決が連携することで、安全にスタイルを上書きできる。

**`border` と `border-warn` を別の引数に分けて書ける**のがこのパターンの要点である。ベース側で
「枠線を引く」ことだけを決め、色は条件側が決める。素の文字列結合では、条件が偽のときに
色クラスが 1 つも付かない状態を作らないよう、両方の分岐に色を書く必要がある。

#### パターン C: 固定ベース + className 透過

**使用箇所**: SocialLinks

```typescript
// SocialLinks.tsx
cn('flex flex-wrap items-center gap-2', className)
```

**特徴**: コンポーネント固有のベーススタイルを定義しつつ、`className` Props で配置（マージン等）を
外部から注入できるようにしている。実際に `client.tsx` が `className="mt-3.5"` を渡しており、
**レイアウトの都合を親が持ち、部品自身は余白を持たない**という分担になっている。

`CareerCard` も `className` を受け取るが、現在それを渡している呼び出し元は無く、透過の口だけが
残っている状態である（以前は `SkillCard` が `animate-fade-in-up` をこの方式で注入していたが、
Skills セクションの削除（issue #126）に伴い無くなった）。

### 2.3 cn() を使っていない箇所

| コンポーネント | 理由 |
|---------------|------|
| `ThemeToggle` | クラスが完全に静的。選択状態は CSS のカスケードが決めるため、JS 側に分岐が無い |
| `ContactForm` | Atoms を並べるだけで、自前のクラス合成を持たない |
| `client.tsx` | セクションのレイアウトはすべて静的クラス |

> **`Header` の 1 箇所は `cn()` が仕事をしていない。** `cn('border-t border-rule md:hidden')` は
> 条件分岐も `className` の受け口も持たないため、`clsx` も `twMerge` も素通りする。
> スクロール状態による切替を廃止した際の名残であり、実害は無いが `cn()` を使う理由も無い。

---

## 3. cn() がない場合の比較

### 3.1 素の className 結合との比較

```typescript
// cn() を使わない場合
<button
    className={`inline-flex rounded-sm font-bold ${
        variant === 'primary'
            ? 'bg-acc text-acc-on hover:opacity-90'
            : variant === 'outline'
            ? 'border border-field text-ink hover:bg-panel'
            : 'text-mute hover:text-ink'
    } ${size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-5 text-sm'} ${
        isLoading ? 'cursor-not-allowed' : ''
    } ${className || ''}`}
/>

// cn() を使う場合
<button className={cn(baseStyles, VARIANT_CLASSES[variant], SIZE_CLASSES[size], isLoading && 'cursor-not-allowed', className)} />
```

### 3.2 cn() の利点まとめ

| 利点 | 説明 |
|------|------|
| **可読性** | テンプレートリテラルのネストがなくなり、意図が明確 |
| **安全性** | `false`, `null`, `undefined` を自動除去（余分なスペースやリテラル "false" が入らない） |
| **Tailwind 競合解決** | `className` Props で渡されたクラスが内部クラスと競合しても正しく上書きされる |
| **保守性** | バリアント・サイズの追加がオブジェクトマップへの1行追加で完結 |

---

## 4. className Props の設計意図

`cn()` を使う 4 つの Atom と 2 つの Molecule は `className` Props を受け取り、`cn()` の最後の引数に渡す。

```typescript
// コンポーネント内部
cn(内部スタイル, ..., className)  // className は最後に渡す
```

**`className` を最後に渡す理由**:

- `tailwind-merge` は後に記述されたクラスを優先する
- 外部から渡されたクラスが内部のデフォルトスタイルを確実に上書きできる

**実例（client.tsx → SocialLinks）**:

```tsx
// client.tsx（About セクション）
<SocialLinks links={portfolioData.about_data.sns_list} className="mt-3.5" />
```

`SocialLinks` 内部の `cn('flex flex-wrap items-center gap-2', className)` により、`mt-3.5` が
追加クラスとして適用される。`className` を最後に渡しているため、ベーススタイルと競合した場合も
外部指定が優先される。

**ただし全部品が受け取るわけではない。** `ThemeToggle` は `className` を持たない。配置を外から
変える必要が無く、受け口を用意すると「どこからでも見た目を書き換えられる部品」になってしまうため。
**透過の口は必要になった時点で開ける**方針を取っている。
