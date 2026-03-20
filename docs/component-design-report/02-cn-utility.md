# cn() ユーティリティ設計レポート

| 項目 | 内容 |
|------|------|
| プロジェクト名 | TechProfile Pro |
| ドキュメント種別 | cn() ユーティリティ設計レポート |
| 作成日 | 2026-03-20 |

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

```
入力: cn('px-4 text-white', isError && 'text-red-400', className)
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
    ・例: 'text-white text-red-400' → 'text-red-400'（後勝ち）
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
| `atoms/Badge.tsx` | 1 | ベース + バリアント + サイズ + className |
| `molecules/CareerCard.tsx` | 1 | ベース + className |
| `molecules/SkillCard.tsx` | 1 | ベース + className |
| `molecules/SocialLinks.tsx` | 2 | コンテナレイアウト + アイコンサイズ |
| `organisms/Header.tsx` | 4 | スクロール状態に応じた動的スタイル切替 |
| **合計** | **12** | |

### 2.2 パターン別分類

#### パターン A: バリアント + サイズ + className 結合

**使用箇所**: Button, Badge

```typescript
// Button.tsx
cn(baseStyles, variants[variant], sizes[size], isLoading && '...', className)
```

**構造**:
```
cn(
    固定ベーススタイル,      // 'rounded-xl font-semibold ...'
    バリアントマップ[値],     // variants['primary'] → 'glass-card bg-gradient-to-r ...'
    サイズマップ[値],         // sizes['md'] → 'h-10 px-4 text-base'
    条件付きクラス,           // isLoading && 'cursor-not-allowed'
    外部からの className      // 親コンポーネントによるカスタマイズ
)
```

**特徴**: オブジェクトマップでバリアントとサイズを管理し、`cn()` で結合する。新しいバリアント追加はマップに1行追加するだけで完了する。

#### パターン B: 条件分岐によるスタイル切替

**使用箇所**: Input, TextArea, Header

```typescript
// Input.tsx
cn(
    'glass-effect rounded-xl px-4 py-3 ...',
    hasError
        ? 'border-red-400/50 focus:ring-red-400/50'
        : 'border-white/20 focus:ring-primary-400/50',
    className,
)
```

**特徴**: 三項演算子で状態に応じたスタイルセットを丸ごと切り替える。`clsx` の条件処理と `twMerge` のクラス競合解決が連携することで、安全にスタイルを上書きできる。

#### パターン C: 固定ベース + className 透過

**使用箇所**: CareerCard, SkillCard

```typescript
// CareerCard.tsx
cn('glass-card floating-card overflow-hidden ...', className)
```

**特徴**: コンポーネント固有のベーススタイルを定義しつつ、`className` Props でアニメーションクラス等を外部から注入できるようにしている。SkillCard では `animate-fade-in-up` をこの方式で注入している。

#### パターン D: 複数インスタンスでの動的切替

**使用箇所**: Header（4箇所）

```typescript
// Header.tsx — ヘッダー全体
cn(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
    isScrolled
        ? 'glass-effect shadow-glass border-b border-white/10'
        : 'bg-transparent',
)

// Header.tsx — ロゴ
cn(
    'font-bold tracking-wider ...',
    isScrolled ? 'text-primary-400' : 'neon-text',
)

// Header.tsx — ナビ項目
cn(
    'transition-all duration-200 ...',
    isScrolled
        ? 'text-white hover:text-primary-400'
        : 'text-secondary-200 hover:text-white',
)
```

**特徴**: 同一の `isScrolled` 状態を参照して、ヘッダー内の複数要素のスタイルを一貫して切り替える。`cn()` がなければ各要素に `style` 属性か個別の条件ロジックが必要になる。

---

## 3. cn() がない場合の比較

### 3.1 素の className 結合との比較

```typescript
// cn() を使わない場合
<button
    className={`rounded-xl font-semibold ${
        variant === 'primary'
            ? 'glass-card bg-gradient-to-r from-primary-500 to-purple-500'
            : variant === 'secondary'
            ? 'glass-effect text-white'
            : ''
    } ${size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-4 text-base'} ${
        isLoading ? 'cursor-not-allowed' : ''
    } ${className || ''}`}
/>

// cn() を使う場合
<button className={cn(baseStyles, variants[variant], sizes[size], isLoading && '...', className)} />
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

全コンポーネントが `className` Props を受け取り `cn()` の最後の引数に渡す設計には、以下の意図がある。

```typescript
// コンポーネント内部
cn(内部スタイル, ..., className)  // className は最後に渡す
```

**`className` を最後に渡す理由**:
- `tailwind-merge` は後に記述されたクラスを優先する
- 外部から渡されたクラスが内部のデフォルトスタイルを確実に上書きできる

**実例（page.tsx → SkillCard）**:

```tsx
// page.tsx
<SkillCard
    className={isNew ? 'animate-fade-in-up' : ''}  // アニメーション注入
    style={isNew ? { animationDelay: `${(index - prev) * 0.1}s` } : undefined}
/>
```

SkillCard 内部の `cn('glass-card floating-card ...', className)` により、`animate-fade-in-up` が追加クラスとして適用される。
