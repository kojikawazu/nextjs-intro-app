# TechProfile Pro - Portfolio Site

ソフトウェアエンジニアのポートフォリオサイト

## 🚀 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod
- **Image Optimization**: Next.js Image

## 📋 必要条件

- Node.js 18.0.0 以上
- pnpm

## 🛠️ セットアップ

1. **リポジトリのクローン**

    ```bash
    git clone <repository-url>
    cd intro-mcp-sample
    ```

2. **依存関係のインストール**

    ```bash
    pnpm install
    ```

3. **環境変数の設定**

    ```bash
    cp .env.example .env.local
    ```

4. **開発サーバーの起動**

    ```bash
    npm run dev
    ```

5. **ブラウザでアクセス**
   http://localhost:3000

## 📁 プロジェクト構成

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # グローバルスタイル
│   ├── layout.tsx      # ルートレイアウト
│   └── page.tsx        # ホームページ
├── components/         # Reactコンポーネント
│   ├── atoms/          # 原子コンポーネント
│   ├── molecules/      # 分子コンポーネント
│   └── organisms/      # 生物コンポーネント
├── lib/                # ユーティリティ関数
├── types/              # TypeScript型定義
└── utils/              # ヘルパー関数
```

## 🎨 コンポーネント設計

### Atomic Design

- **Atoms**: Button, Input, TextArea, Badge
- **Molecules**: SkillCard, CareerCard, SocialLinks
- **Organisms**: Header, ContactForm

### レスポンシブデザイン

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 📊 データ管理

現在はローカルの `sample.json` ファイルからデータを取得しています。

### データ構造

- **navbar_data**: ナビゲーション情報
- **hero_data**: ヒーローセクション
- **about_data**: 自己紹介・SNSリンク
- **career_data**: 経歴情報
- **skills_data**: 技術スキル
- **contact_data**: お問い合わせフォーム設定
- **footer_data**: フッター情報

## 🔧 利用可能なスクリプト

```bash
pnpm dev        # 開発サーバー起動
pnpm build      # プロダクションビルド
pnpm start      # プロダクションサーバー起動
pnpm lint       # ESLint実行
pnpm format     # Prettier実行
pnpm type-check # TypeScript型チェック
```

## 🎯 機能

### 実装済み機能

- ✅ レスポンシブデザイン
- ✅ スムーススクロールナビゲーション
- ✅ ヒーローセクション
- ✅ Aboutセクション（プロフィール・SNSリンク）
- ✅ Careerセクション（タイムライン表示）
- ✅ Skillsセクション（カード表示）
- ✅ お問い合わせフォーム（バリデーション付き）
- ✅ SEO対応
- ✅ アクセシビリティ対応

### 今後の拡張予定
- 🗄️ データ更新

## 🚀 デプロイ

### ローカルビルド

```bash
pnpm build
pnpm start
```

### Vercel（簡易デプロイ）

```bash
npx vercel
```

## 🤝 コントリビューション

1. フォークする
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

