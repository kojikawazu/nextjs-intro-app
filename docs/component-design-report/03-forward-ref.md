# React.forwardRef 設計レポート

| 項目 | 内容 |
|------|------|
| プロジェクト名 | TechProfile Pro |
| ドキュメント種別 | React.forwardRef 設計レポート |
| 作成日 | 2026-03-20 |

---

## 1. forwardRef の概要と本プロジェクトでの必要性

### 1.1 React.forwardRef とは

`React.forwardRef` は、親コンポーネントから子コンポーネント内部の DOM 要素に `ref` を渡すための React API である。通常、`ref` は Props として転送されないため、カスタムコンポーネントの内部 DOM 要素にアクセスするにはこの仕組みが必要になる。

### 1.2 本プロジェクトで forwardRef が必要な理由

本プロジェクトでは、お問い合わせフォーム（`ContactForm`）で **React Hook Form** を使用している。React Hook Form の `register()` 関数は、フォーム要素への `ref` を返す。この `ref` を通じて以下の処理を行う:

- フォーム要素の値の取得・設定
- フォーカス制御（バリデーションエラー時のフォーカス移動）
- DOM イベントのリスナー登録

```
React Hook Form の register()
        │
        │ { ref, onChange, onBlur, name } を返す
        ▼
    <Input {...register('name')} />
        │
        │ ref を Input 内部の <input> 要素に転送する必要がある
        ▼
    React.forwardRef で ref を透過
        │
        ▼
    <input ref={ref} /> ← DOM 要素に直接アタッチ
```

**forwardRef がないと**: `register()` が返す `ref` がカスタムコンポーネントで止まり、内部の `<input>` 要素に到達しない。React Hook Form はフォーム要素を認識できず、バリデーションやフォーカス管理が動作しなくなる。

---

## 2. 実装されているコンポーネント

### 2.1 対象コンポーネント一覧

| コンポーネント | HTML 要素 | forwardRef 型引数 | displayName |
|--------------|----------|-------------------|-------------|
| `Button` | `<button>` | `React.forwardRef<HTMLButtonElement, ButtonProps>` | `'Button'` |
| `Input` | `<input>` | `React.forwardRef<HTMLInputElement, InputProps>` | `'Input'` |
| `TextArea` | `<textarea>` | `React.forwardRef<HTMLTextAreaElement, TextAreaProps>` | `'TextArea'` |

### 2.2 forwardRef を使用しないコンポーネント

| コンポーネント | 理由 |
|--------------|------|
| `Badge` | 表示専用。外部から DOM 要素にアクセスする必要がない |
| `CareerCard` | 表示専用。フォーム要素を含まない |
| `SkillCard` | 表示専用。フォーム要素を含まない |
| `SocialLinks` | リンク表示専用。外部からの ref 制御不要 |
| `Header` | Organism。内部で状態管理を完結している |
| `ContactForm` | Organism。内部で React Hook Form を使用し、Atoms に ref を渡す側 |

**判断基準**: フォーム要素（`<input>`, `<textarea>`, `<button>`）をラップする Atom コンポーネントのみが `forwardRef` を使用する。

---

## 3. 実装パターンの詳細

### 3.1 共通パターン

3つのコンポーネントは同一の実装パターンに従っている。

```typescript
// ① Props 型定義 — HTML 要素のネイティブ属性を継承
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

// ② forwardRef でコンポーネントを定義
const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, className, required, ...props }, ref) => {
        //       ↑ カスタム Props を分割代入        ↑ ref は第2引数

        return (
            <div>
                {label && <label>...</label>}
                <input
                    ref={ref}         // ③ ref を DOM 要素に渡す
                    className={cn(...);}
                    {...props}        // ④ 残りの HTML 属性をすべて透過
                />
                {error && <p>...</p>}
            </div>
        );
    },
);

// ⑤ displayName を設定（React DevTools 対応）
Input.displayName = 'Input';
```

### 3.2 各ステップの解説

#### ① Props 型の継承

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { ... }
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { ... }
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { ... }
```

HTML 要素のネイティブ属性型を `extends` することで、`onClick`, `disabled`, `placeholder`, `type` 等の標準属性をすべて Props として受け取れる。カスタム Props（`label`, `error`, `variant` 等）のみを明示的に定義すればよい。

#### ② forwardRef の型引数

```typescript
React.forwardRef<HTMLButtonElement, ButtonProps>(...)
//                ↑ ref の対象型         ↑ Props 型
```

- 第1型引数: `ref` が指す DOM 要素の型
- 第2型引数: コンポーネントの Props 型

これにより、TypeScript が `ref.current` のプロパティや Props を正確に型チェックする。

#### ③ ref の転送

```typescript
<input ref={ref} ... />
```

`forwardRef` の第2引数として受け取った `ref` を、内部の DOM 要素に直接渡す。これにより、親コンポーネントが `ref` を通じてこの `<input>` 要素にアクセスできる。

#### ④ Props のスプレッド

```typescript
const { label, error, hint, className, required, ...props } = props;
// カスタム Props を取り出し、残り（HTML ネイティブ属性）を ...props に集約
<input {...props} />
// ネイティブ属性をすべて DOM 要素に透過
```

**重要**: カスタム Props（`label`, `error` 等）を分割代入で取り出さないと、`<input label="..." error="...">` のように無効な HTML 属性が DOM に渡されてしまう。

#### ⑤ displayName の設定

```typescript
Input.displayName = 'Input';
```

`forwardRef` で作成したコンポーネントは、デフォルトでは React DevTools に `ForwardRef` と表示される。`displayName` を設定することで、`Input` と表示され、デバッグが容易になる。

---

## 4. ContactForm での統合フロー

### 4.1 React Hook Form との接続

```tsx
// ContactForm.tsx（Organism）
const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormInput>({
    resolver: zodResolver(ContactFormSchema),
});

// register('name') は以下のオブジェクトを返す:
// { ref: (element) => void, onChange: ..., onBlur: ..., name: 'name' }

<Input
    label="お名前"
    required
    placeholder="山田 太郎"
    {...register('name')}        // ref, onChange, onBlur, name が展開される
    error={errors.name?.message}
/>
```

### 4.2 データフロー図

```
ContactForm (Organism)
    │
    │ useForm({ resolver: zodResolver(ContactFormSchema) })
    │
    ├── register('name') → { ref, onChange, onBlur, name }
    │       │
    │       ▼
    │   <Input {...register('name')} error={errors.name?.message}>
    │       │
    │       │ forwardRef で ref を転送
    │       ▼
    │   <input ref={ref} onChange={onChange} onBlur={onBlur} name="name" />
    │       │
    │       │ ユーザー入力イベント
    │       ▼
    │   React Hook Form が値を追跡
    │
    ├── register('email') → { ref, onChange, onBlur, name }
    │       │
    │       ▼
    │   <Input {...register('email')} error={errors.email?.message}>
    │       │
    │       ▼
    │   <input ref={ref} type="email" ... />
    │
    └── register('message') → { ref, onChange, onBlur, name }
            │
            ▼
        <TextArea {...register('message')} error={errors.message?.message}>
            │
            ▼
        <textarea ref={ref} ... />
```

### 4.3 バリデーション時のフォーカス制御

React Hook Form は `ref` を通じてバリデーションエラー時に該当フィールドへ自動フォーカスを移動する機能を持つ。

```
ユーザーが「送信」ボタンをクリック
    │
    ▼
handleSubmit が Zod スキーマでバリデーション実行
    │
    ├── 成功 → onSubmit コールバック実行
    │
    └── 失敗 → errors オブジェクトにエラーを格納
              │
              ├── errors.name → Input に error Props として渡される
              │                 → 赤ボーダー + エラーメッセージ表示
              │
              └── React Hook Form が ref 経由で
                  最初のエラーフィールドにフォーカスを移動
                  （shouldFocusError オプション）
```

この自動フォーカス移動が正しく機能するためには、`forwardRef` による ref 転送が不可欠である。

---

## 5. forwardRef と Atoms / Organisms の責務分離

### 5.1 設計上の位置づけ

```
┌──────────────────────────────────────────────────────┐
│ ContactForm (Organism)                                │
│   責務: フォームロジック、バリデーション、API通信          │
│   所有: useForm, register(), handleSubmit()            │
│                                                      │
│   ┌──────────────────────────────────────────────┐   │
│   │ Input (Atom)                                  │   │
│   │   責務: 見た目（スタイル、ラベル、エラー表示）      │   │
│   │   forwardRef: register() の ref を <input> に転送 │   │
│   │   → ロジックは持たない、ref を透過するだけ          │   │
│   └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**Atom の役割**: ref を受け取り、内部の DOM 要素に転送するだけ。バリデーションロジックやフォーム状態は一切知らない。

**Organism の役割**: React Hook Form を通じてフォーム全体を管理し、`register()` の戻り値を各 Atom に渡す。

この分離により、Input / TextArea は ContactForm 以外の文脈でも再利用可能であり、逆に ContactForm は Input の内部実装に依存しない。

### 5.2 Button の forwardRef

Button も `forwardRef` を使用しているが、現時点では ContactForm 内で `register()` を通じた ref 転送は行っていない（送信ボタンは `type="submit"` で、React Hook Form がフォームの `onSubmit` イベントで処理する）。

Button に `forwardRef` が実装されている理由:
- 将来的にプログラム的なフォーカス制御やクリックトリガーが必要になった場合に備える
- Atom コンポーネントとしての一貫性（フォーム要素系 Atom は全て forwardRef 対応）
- 外部からの DOM アクセスを許容する設計方針

---

## 6. まとめ: 3つの要素の連携

```
┌─────────────────────────────────────────────────────────────┐
│                   コンポーネント設計の3本柱                      │
│                                                             │
│  ┌────────────────┐                                         │
│  │  Atomic Design  │ → コンポーネントの階層構造を定義           │
│  │  atoms/         │   Atoms: 最小パーツ（Button, Input...）  │
│  │  molecules/     │   Molecules: 複合表示（Card 系）         │
│  │  organisms/     │   Organisms: 機能単位（Form, Header）    │
│  └───────┬────────┘                                         │
│          │                                                  │
│  ┌───────▼────────┐                                         │
│  │     cn()       │ → 全階層でスタイルを安全に合成             │
│  │  clsx +        │   バリアント切替、条件付きクラス、           │
│  │  tailwind-merge│   className Props の透過を実現            │
│  └───────┬────────┘                                         │
│          │                                                  │
│  ┌───────▼────────┐                                         │
│  │  forwardRef    │ → Atoms と Organisms の間で ref を橋渡し   │
│  │  Button        │   React Hook Form の register() が       │
│  │  Input         │   Atom 内部の DOM 要素に到達可能にする      │
│  │  TextArea      │                                         │
│  └────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

- **Atomic Design** がコンポーネントの責務と階層を定義し
- **cn()** が各階層でのスタイル合成を安全に行い
- **forwardRef** が階層を跨いだ DOM アクセスを可能にする

この3つの要素が連携することで、再利用性・型安全性・保守性の高いコンポーネントアーキテクチャが実現されている。
