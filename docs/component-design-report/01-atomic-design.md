# Atomic Design コンポーネント設計レポート

| 項目 | 内容 |
|------|------|
| プロジェクト名 | TechProfile Pro |
| ドキュメント種別 | コンポーネント設計レポート |
| 作成日 | 2026-03-20 |

---

## 1. Atomic Design の採用方針

本プロジェクトでは Brad Frost が提唱した **Atomic Design** をベースに、UIコンポーネントを3階層で構造化している。Atomic Design 本来の5階層（Atoms → Molecules → Organisms → Templates → Pages）から、Templates 層を省略し、Pages は Next.js App Router の `page.tsx` が担う構成としている。

```
src/components/
├── atoms/          ← 最小単位の汎用UIパーツ（4コンポーネント）
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   └── TextArea.tsx
├── molecules/      ← Atoms を組み合わせた複合コンポーネント（3コンポーネント）
│   ├── CareerCard.tsx
│   ├── SkillCard.tsx
│   └── SocialLinks.tsx
└── organisms/      ← 独立した機能単位のコンポーネント（2コンポーネント）
    ├── ContactForm.tsx
    └── Header.tsx
```

---

## 2. Atoms（原子コンポーネント）

Atoms は **単一の HTML 要素をラップ** し、プロジェクト固有のスタイルと Props インターフェースを提供する最小単位のコンポーネントである。

### 2.1 共通設計原則

| 原則 | 実装方法 |
|------|---------|
| Props 拡張 | 対応する HTML 要素の属性型を `extends` して継承（例: `ButtonHTMLAttributes<HTMLButtonElement>`） |
| スタイル合成 | `cn()` ユーティリティでベーススタイル + バリアント + カスタムクラスを結合 |
| ref 転送 | フォーム要素（Button, Input, TextArea）は `React.forwardRef` で ref を外部公開 |
| className 拡張 | 全コンポーネントで `className` Props を受け取り、外部からのスタイル追加を許容 |

### 2.2 Button

**ファイル**: `src/components/atoms/Button.tsx`

| Props | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | 外観バリアント |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | サイズ |
| `isLoading` | `boolean` | `false` | ローディング状態（スピナー表示 + disabled） |
| `children` | `ReactNode` | - | ボタンテキスト |

**バリアント定義（オブジェクトマップ方式）**:

```typescript
const variants = {
    primary: 'glass-card bg-gradient-to-r from-primary-500 to-purple-500 ...',
    secondary: 'glass-effect text-white ...',
    outline: 'glass-effect border-2 border-primary-400/50 ...',
    ghost: 'text-secondary-300 hover:bg-white/10 ...',
};
```

バリアントとサイズをオブジェクトマップで管理し、`cn()` で結合するパターンは、条件分岐の複雑化を防ぎ、新しいバリアント追加も容易にする。

**ローディング状態**:
- `isLoading=true` 時、SVG スピナーアニメーション + `disabled` を自動適用
- ボタンテキストの左にスピナーを配置（`animate-spin`）

**forwardRef**: あり — `React.forwardRef<HTMLButtonElement, ButtonProps>`

### 2.3 Input

**ファイル**: `src/components/atoms/Input.tsx`

| Props | 型 | 説明 |
|-------|-----|------|
| `label` | `string?` | ラベルテキスト（`required` 時に赤アスタリスク表示） |
| `error` | `string?` | エラーメッセージ（赤テキスト、エラー時ボーダー赤） |
| `hint` | `string?` | ヒントテキスト（エラー非表示時のみ表示） |

**エラー状態のスタイル切替**:

```typescript
const hasError = !!error;
// cn() でエラー状態に応じてボーダー・フォーカスリングの色を切替
cn(
    'glass-effect rounded-xl ...',
    hasError
        ? 'border-red-400/50 focus:ring-red-400/50'
        : 'border-white/20 focus:ring-primary-400/50',
    className,
)
```

エラー状態を `boolean` フラグに変換し、`cn()` の条件分岐で赤系/通常系のスタイルを切り替えている。`error` と `hint` は排他表示（error 優先）。

**forwardRef**: あり — `React.forwardRef<HTMLInputElement, InputProps>`

### 2.4 TextArea

**ファイル**: `src/components/atoms/TextArea.tsx`

Input と同一のインターフェース設計。追加で `min-h-[120px]` と `resize-y` を適用。エラー処理・ヒント表示のロジックも Input と同一パターンで実装されている。

**forwardRef**: あり — `React.forwardRef<HTMLTextAreaElement, TextAreaProps>`

### 2.5 Badge

**ファイル**: `src/components/atoms/Badge.tsx`

| Props | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| `variant` | `'default' \| 'secondary' \| 'accent' \| 'outline'` | `'default'` | カラーバリアント |
| `size` | `'sm' \| 'md'` | `'md'` | サイズ |

**特徴**: Badge は表示専用コンポーネントであるため、`forwardRef` は未使用。`HTMLDivElement` の属性を継承し、`div` 要素としてレンダリングする。`hover:scale-105` によるホバー効果と `glass-effect` ベースのスタイルを持つ。

---

## 3. Molecules（分子コンポーネント）

Molecules は **Atoms や基本要素を組み合わせた複合コンポーネント** である。独自の状態管理は持たず、Props 経由でデータを受け取り表示する。

### 3.1 CareerCard

**ファイル**: `src/components/molecules/CareerCard.tsx`

**依存 Atom**: `Badge`

| Props | 型 | 説明 |
|-------|-----|------|
| `title` | `string` | プロジェクトタイトル |
| `period` | `string` | 期間（フォーマット済み） |
| `teamSize` | `string` | チーム規模 |
| `description` | `string` | 説明 |
| `techStack` | `string[]` | 技術スタック（Badge で表示） |
| `phases` | `string[]` | 担当フェーズ（Badge で表示） |
| `role` | `string` | 役割 |
| `isCurrent` | `boolean?` | 現在進行中フラグ |

**構造**:

```
CareerCard (glass-card + floating-card)
├── ヘッダー部
│   ├── タイトル（hover で neon-text）
│   ├── 期間（SVG カレンダーアイコン付き）
│   ├── チーム規模（SVG ユーザーアイコン付き）
│   └── 「現在」Badge（isCurrent=true 時、animate-pulse）
├── 区切り線（グラデーション）
├── 説明文
├── 技術スタック（Badge variant="secondary" の列挙）
├── 担当フェーズ（Badge variant="outline" の列挙）
├── 役割
└── 下部ホバーライン（scaleX(0) → scaleX(100) アニメーション）
```

**ホバーエフェクト**:
- `floating-card` クラスによるカード全体の浮き上がり
- 下部のグラデーションラインが `group-hover:scale-x-100` で伸びる
- タイトルが `group-hover:neon-text` で発光テキストに変化

### 3.2 SkillCard

**ファイル**: `src/components/molecules/SkillCard.tsx`

**依存**: `next/image`（Next.js Image コンポーネント）

| Props | 型 | 説明 |
|-------|-----|------|
| `name` | `string` | スキル名 |
| `description` | `string` | 説明テキスト |
| `iconUrl` | `string` | アイコン画像URL |
| `className` | `string?` | 追加CSSクラス（アニメーション用） |
| `style` | `CSSProperties?` | インラインスタイル（animationDelay 用） |

**特徴**:
- `className` と `style` Props を公開し、親コンポーネント（`page.tsx`）からアニメーション制御を注入可能
- アイコンの背景にグラデーション（`from-primary-400 to-purple-400`）をオーバーレイ
- CareerCard と同様の `floating-card` + 下部ホバーラインパターン

### 3.3 SocialLinks

**ファイル**: `src/components/molecules/SocialLinks.tsx`

**依存**: `next/image`、`SNSItem` 型（`@/types/portfolio`）

| Props | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| `links` | `SNSItem[]` | - | SNSリンクデータ配列 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | アイコンサイズ |

**サイズマッピング**:

```typescript
const sizes = {
    sm: { container: 'w-6 h-6', width: 24, height: 24 },
    md: { container: 'w-8 h-8', width: 32, height: 32 },
    lg: { container: 'w-10 h-10', width: 40, height: 40 },
};
```

**セキュリティ対策**:
- 全外部リンクに `target="_blank"` + `rel="noopener noreferrer"` を適用
- `aria-label` に「{SNS名}のプロフィールを開く」を設定（アクセシビリティ）

**ホバーエフェクト**: 白色オーバーレイ（`absolute inset-0 bg-white opacity-0 → opacity-20`）+ `scale-110`

---

## 4. Organisms（生体コンポーネント）

Organisms は **独自の状態管理・イベント処理・API通信を持つ** 複合的な機能コンポーネントである。

### 4.1 Header

**ファイル**: `src/components/organisms/Header.tsx`

**依存 Atom**: なし（純粋な HTML 要素のみ）

| Props | 型 | 説明 |
|-------|-----|------|
| `navItems` | `Array<{name: string, href: string}>` | ナビゲーション項目 |
| `logo` | `string` | ロゴテキスト |

**内部状態**:

| State | 型 | 用途 |
|-------|-----|------|
| `isScrolled` | `boolean` | スクロール位置に応じたスタイル切替 |
| `isMobileMenuOpen` | `boolean` | モバイルメニューの開閉制御 |

**cn() の活用（4箇所）**:

Header コンポーネントは `cn()` を最も多用するコンポーネントであり、スクロール状態に応じた動的なスタイル切替に活用している。

```typescript
// ヘッダー全体: スクロール状態でガラスエフェクト or 透明
cn('fixed top-0 ...', isScrolled ? 'glass-effect shadow-glass' : 'bg-transparent')

// ロゴ: スクロール状態でテキストスタイル変化
cn('font-bold ...', isScrolled ? 'text-primary-400' : 'neon-text')

// ナビ項目: スクロール状態で文字色変化
cn('transition-all ...', isScrolled ? 'text-white ...' : 'text-secondary-200 ...')
```

**スクロール検知**:
- `useEffect` で `scroll` イベントリスナーを登録
- 閾値 `10px` を超えた場合に `isScrolled` を `true` に設定
- クリーンアップ関数でリスナーを解除

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

**画面遷移（3状態）**:

```
[フォーム表示] → 送信 → [送信中（ローディング）] → 成功 → [送信完了画面]
                                                  → 失敗 → [エラー表示 + フォーム]
```

---

## 5. ページレベルの組み立て（page.tsx）

`src/app/page.tsx` は `'use client'` ディレクティブによるクライアントコンポーネントであり、全ての Atoms / Molecules / Organisms を組み合わせてポートフォリオサイト全体を構成する。

### 5.1 コンポーネント依存ツリー

```
page.tsx
├── Header (organism)
│   └── [navItems, logo] ← portfolioData.navbar_data から生成
├── Hero Section（直接実装）
│   └── Button (atom) ← CTA ボタン
├── About Section（直接実装）
│   ├── SocialLinks (molecule) ← portfolioData.about_data.sns_list
│   └── next/image ← プロフィール画像
├── Career Section（直接実装）
│   └── CareerCard (molecule) × N件
│       └── Badge (atom) ← 技術スタック・フェーズ表示
├── Skills Section（直接実装）
│   └── SkillCard (molecule) × 最大N件（段階表示）
│       └── next/image ← スキルアイコン
├── Contact Section（直接実装）
│   └── ContactForm (organism)
│       ├── Input (atom) ← 名前・メール入力
│       ├── TextArea (atom) ← メッセージ入力
│       └── Button (atom) ← 送信ボタン
└── Footer（直接実装）
```

### 5.2 状態管理

| State / Ref | 型 | 管理対象 |
|-------------|-----|---------|
| `portfolioData` | `useState<PortfolioData \| null>` | API取得データ |
| `loading` | `useState<boolean>` | ローディング状態 |
| `visibleSkillsCount` | `useState<number>` | スキル表示件数（初期値: 9） |
| `prevVisibleCountRef` | `useRef<number>` | 前回表示件数（アニメーション制御用） |

### 5.3 Atomic Design の階層関係

```
┌─────────────────────────────────────────────────────┐
│                    Page (page.tsx)                    │
│    データ取得 / 状態管理 / セクションレイアウト          │
├─────────────────────────────────────────────────────┤
│              Organisms（独立機能単位）                 │
│    Header: スクロール検知 + ナビゲーション制御          │
│    ContactForm: フォーム管理 + API通信                │
├─────────────────────────────────────────────────────┤
│              Molecules（複合表示部品）                 │
│    CareerCard: Badge を使った経歴情報表示              │
│    SkillCard: Image を使ったスキル情報表示             │
│    SocialLinks: Image を使ったSNSリンク一覧           │
├─────────────────────────────────────────────────────┤
│               Atoms（最小UIパーツ）                   │
│    Button / Input / TextArea / Badge                │
│    → forwardRef / cn() / variant パターン            │
└─────────────────────────────────────────────────────┘
```

---

## 6. 設計上の特徴と考察

### 6.1 採用しているパターン

| パターン | 実装箇所 | 効果 |
|---------|---------|------|
| **バリアントマップ** | Button, Badge | `if/else` の乱立を防ぎ、バリアント追加を容易にする |
| **サイズマップ** | Button, Badge, SocialLinks | サイズごとのスタイル定義を一箇所に集約 |
| **グループホバー** | CareerCard, SkillCard | `group` + `group-hover:` でカード内要素のホバー連動を実現 |
| **条件付き cn()** | Header, Input, TextArea | 状態に応じたスタイル切替を宣言的に記述 |
| **Props スプレッド** | 全 Atoms | `{...props}` で HTML ネイティブ属性をすべて透過 |
| **displayName** | forwardRef 使用 Atoms | React DevTools でのデバッグ容易性を確保 |

### 6.2 階層間の責務分離

| 階層 | 責務 | 状態管理 | 外部通信 |
|------|------|---------|---------|
| Atoms | 単一要素のスタイル・インタラクション | なし | なし |
| Molecules | 複数要素の組み合わせ表示 | なし | なし |
| Organisms | 機能ロジック（フォーム、ナビ） | あり（useState, useEffect） | あり（API通信） |
| Page | 全体レイアウト + データ取得 | あり（useState, useRef） | あり（fetch） |

この分離により、Atoms / Molecules はステートレスで再利用性が高く、ビジネスロジックは Organisms / Page に集約されている。
