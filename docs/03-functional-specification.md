# TechProfile Pro 機能仕様書

## 目次

- [1. ドキュメント概要](#1-ドキュメント概要)
- [2. 全体アーキテクチャ](#2-全体アーキテクチャ)
    - [2.1 ページ構成](#21-ページ構成)
    - [2.2 データフロー](#22-データフロー)
- [3. セクション別機能仕様](#3-セクション別機能仕様)
    - [3.1 Header / ナビゲーション](#31-header--ナビゲーション)
        - [機能概要](#機能概要)
        - [仕様詳細](#仕様詳細)
        - [デスクトップナビゲーション (md以上)](#デスクトップナビゲーション-md以上)
        - [モバイルナビゲーション (md未満)](#モバイルナビゲーション-md未満)
    - [3.2 Hero Section](#32-hero-section)
        - [機能概要](#機能概要-1)
        - [仕様詳細](#仕様詳細-1)
        - [レイヤー構成 (背面から前面)](#レイヤー構成-背面から前面)
        - [アニメーション](#アニメーション)
    - [3.3 About Section](#33-about-section)
        - [機能概要](#機能概要-2)
        - [仕様詳細](#仕様詳細-2)
        - [左カラム (プロフィール画像 + SNS)](#左カラム-プロフィール画像--sns)
        - [右カラム (テキスト)](#右カラム-テキスト)
    - [3.4 Career Section](#34-career-section)
        - [機能概要](#機能概要-3)
        - [仕様詳細](#仕様詳細-3)
        - [タイムライン表示](#タイムライン表示)
        - [CareerCard コンポーネント仕様](#careercard-コンポーネント仕様)
        - [日付フォーマットロジック (`formatCareerPeriod`)](#日付フォーマットロジック-formatcareerperiod)
    - [3.5 Skills Section](#35-skills-section)
        - [機能概要](#機能概要-4)
        - [仕様詳細](#仕様詳細-4)
        - [ページネーション (スキル段階表示)](#ページネーション-スキル段階表示)
        - [SkillCard コンポーネント仕様](#skillcard-コンポーネント仕様)
    - [3.6 Contact Section](#36-contact-section)
        - [機能概要](#機能概要-5)
        - [仕様詳細](#仕様詳細-5)
        - [フォームフィールド](#フォームフィールド)
        - [バリデーションルール (Zod スキーマ)](#バリデーションルール-zod-スキーマ)
        - [サーバーサイドバリデーション (`POST /api/contact`)](#サーバーサイドバリデーション-post-apicontact)
        - [送信フロー](#送信フロー)
        - [送信完了画面](#送信完了画面)
        - [メール送信仕様](#メール送信仕様)
    - [3.7 Footer](#37-footer)
        - [機能概要](#機能概要-6)
        - [仕様詳細](#仕様詳細-6)
- [4. ユーザーフロー](#4-ユーザーフロー)
    - [4.1 ページ読み込みフロー](#41-ページ読み込みフロー)
    - [4.2 ナビゲーションフロー](#42-ナビゲーションフロー)
    - [4.3 スキル展開フロー](#43-スキル展開フロー)
    - [4.4 お問い合わせ送信フロー](#44-お問い合わせ送信フロー)
- [5. UI/UX仕様](#5-uiux仕様)
    - [5.1 レスポンシブブレークポイント](#51-レスポンシブブレークポイント)
    - [5.2 コンテナ仕様](#52-コンテナ仕様)
    - [5.3 セクションパディング](#53-セクションパディング)
    - [5.4 カラーシステム](#54-カラーシステム)
    - [5.5 グラスモーフィズムデザイン](#55-グラスモーフィズムデザイン)
    - [5.6 アニメーション一覧](#56-アニメーション一覧)
    - [5.7 インタラクション効果](#57-インタラクション効果)
    - [5.8 フォント](#58-フォント)
- [6. コンポーネント階層とデザインシステム](#6-コンポーネント階層とデザインシステム)
    - [6.1 Atomic Design 構成](#61-atomic-design-構成)
    - [6.2 Atoms](#62-atoms)
        - [Button](#button)
        - [Input](#input)
        - [TextArea](#textarea)
        - [Badge](#badge)
    - [6.3 Molecules](#63-molecules)
        - [SkillCard](#skillcard)
        - [CareerCard](#careercard)
        - [SocialLinks](#sociallinks)
    - [6.4 Organisms](#64-organisms)
        - [Header](#header)
        - [ContactForm](#contactform)
- [7. ビジネスロジック](#7-ビジネスロジック)
    - [7.1 日付変換 (`toDateString`)](#71-日付変換-todatestring)
    - [7.2 経歴期間フォーマット (`formatCareerPeriod`)](#72-経歴期間フォーマット-formatcareerperiod)
    - [7.3 スキルページネーション](#73-スキルページネーション)
    - [7.4 フォームバリデーション](#74-フォームバリデーション)
    - [7.5 データ取得戦略](#75-データ取得戦略)
- [8. 型定義](#8-型定義)
    - [8.1 ポートフォリオデータ型](#81-ポートフォリオデータ型)
    - [8.2 SNSItem](#82-snsitem)
    - [8.3 お問い合わせフォーム型](#83-お問い合わせフォーム型)
- [9. API仕様](#9-api仕様)
    - [9.1 GET /api/portfolio](#91-get-apiportfolio)
    - [9.2 POST /api/contact](#92-post-apicontact)
- [10. SEO / メタデータ](#10-seo--メタデータ)
- [11. 環境変数](#11-環境変数)
- [12. ユーティリティ](#12-ユーティリティ)
    - [12.1 cn (クラス名マージ)](#121-cn-クラス名マージ)

---

## 1. ドキュメント概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | TechProfile Pro |
| 概要 | ソフトウェアエンジニア向けポートフォリオサイト (SPA) |
| 技術スタック | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| ホスティング | Cloud Run (Docker コンテナ、GitHub Actions CI/CD) |
| データソース | Google Cloud Storage (本番) / ローカルJSON (開発) |
| メール送信 | Resend API |

---

## 2. 全体アーキテクチャ

### 2.1 ページ構成

本アプリケーションはシングルページアプリケーション (SPA) として構成され、全セクションが `src/app/page.tsx` 内に配置されたクライアントコンポーネント (`'use client'`) である。

```
page.tsx (クライアントコンポーネント)
  +-- Header (固定ヘッダー)
  +-- Hero Section
  +-- About Section
  +-- Career Section
  +-- Skills Section
  +-- Contact Section
  +-- Footer
```

### 2.2 データフロー

```
[Google Cloud Storage] -- JSON --> [GET /api/portfolio] -- fetch --> [page.tsx (useState)]
[ContactForm] -- POST /api/contact --> [Resend API] --> メール送信
```

1. ページ読み込み時に `GET /api/portfolio` を呼び出し、ポートフォリオデータを取得する。
2. 本番環境では GCS バケットからJSONファイルを取得する。開発環境では `sample.json` へのフォールバックロジックが存在するが、`sample.json` はリポジトリに含まれていないため、実質的に GCS 接続が必要。
3. API レスポンスには `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400` が設定される。
4. お問い合わせフォームは `POST /api/contact` 経由で Resend API を使用してメール送信を行う。

---

## 3. セクション別機能仕様

### 3.1 Header / ナビゲーション

#### 機能概要
ページ上部に固定表示されるナビゲーションヘッダー。スクロール状態に応じて外観が変化する。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 配置 | `fixed`, `top-0`, `z-50` |
| 高さ | デスクトップ: `h-20` (80px), モバイル: `h-16` (64px) |
| スクロール閾値 | 10px (`SCROLL_THRESHOLD = 10`) |
| 未スクロール時 | 背景透明、ロゴはネオンテキスト、ナビリンクは `secondary-200` |
| スクロール後 | グラスエフェクト (`glass-effect`) + `shadow-glass`、ロゴは `primary-400`、ナビリンクは白 |
| トランジション | `transition-all duration-300` |

#### デスクトップナビゲーション (md以上)
- ナビ項目: About, Career, Skills, Contact (データ駆動)
- クリック時: 対応セクションへスムーズスクロール (`scrollIntoView({ behavior: 'smooth' })`)
- ホバー効果: `hover:scale-105`、テキスト色変化

#### モバイルナビゲーション (md未満)
- ハンバーガーメニューボタン (SVGアイコン、開閉で形状変化)
- `aria-label="メニューを開く"` によるアクセシビリティ対応
- 開閉状態: `isMobileMenuOpen` state で管理
- メニュー展開時: `glass-effect` 背景、ボーダー上部に `border-white/20`
- ナビ項目クリック時: セクションへスクロール後、メニュー自動閉閉

---

### 3.2 Hero Section

#### 機能概要
フルスクリーンのファーストビュー。ビジュアルインパクトを重視した演出でサイトの第一印象を形成する。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 高さ | `min-h-screen` (ビューポート全体) |
| レイアウト | 中央寄せ (`flex items-center justify-center`) |
| オーバーフロー | `overflow-hidden` |

#### レイヤー構成 (背面から前面)

1. **アニメーショングラデーション背景** (`animated-bg`): 4色グラデーション、15秒周期で位置シフト
2. **背景画像** (Unsplash): `opacity-5` で極薄表示、`object-cover`、`priority` 読み込み
3. **メッシュ背景** (`mesh-background`): `opacity-30`
4. **パーティクル背景** (`particle-bg`): `animated-bg` クラスに含まれる
5. **コンテンツ** (`z-10`):
   - タイトル: "Solving Problems with Technology" (`neon-text animate-glow`)
   - サブタイトル: "テクノロジーを使って、お客様の課題解決を実現します"
   - CTA ボタン: "お問い合わせ" (`animate-float`、クリックで Contact セクションへスクロール)

#### アニメーション
- コンテンツ全体: `animate-fade-in-up` (0.8秒、40px上方向から)
- タイトル: `animate-glow` (2秒周期、box-shadow 明滅)
- CTA ボタン: `animate-float` (6秒周期、20px上下浮遊)

---

### 3.3 About Section

#### 機能概要
プロフィール情報とSNSリンクを表示する自己紹介セクション。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 背景 | `bg-gradient-to-br from-secondary-900 to-secondary-800` + `mesh-background opacity-20` |
| パディング | `section-padding` (py-20 / lg:py-32) |
| レイアウト | 2カラム (`grid-cols-1 lg:grid-cols-2`)、`gap-12`、垂直中央揃え |

#### 左カラム (プロフィール画像 + SNS)
- **プロフィール画像**:
  - サイズ: `w-48 h-48` (192px x 192px)
  - 円形 (`rounded-full`)
  - グロー効果: 背景に `bg-gradient-to-br from-yellow-200 via-yellow-100 to-amber-50` + `shadow-neon animate-pulse`
  - 画像加工: `brightness-200 contrast-75 saturate-150`
  - ボーダー: `border-4 border-yellow-300/60`
  - 配置: デスクトップ左寄せ、モバイル中央
- **SNSリンク** (`SocialLinks` コンポーネント):
  - 対応SNS: X, GitHub, Zenn, Qiita (データ駆動)
  - アイコンサイズ: `lg` (40px x 40px)
  - ホバー: `hover:scale-110`、白オーバーレイ
  - 外部リンク: `target="_blank"`, `rel="noopener noreferrer"`
  - `aria-label` によるアクセシビリティ対応

#### 右カラム (テキスト)
- セクションタイトル: "About" (`neon-text`)
- 複数パラグラフの紹介文 (`about_contents` 配列をループ)
- テキスト色: `secondary-200`

---

### 3.4 Career Section

#### 機能概要
経歴をタイムライン形式で表示するセクション。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 背景 | `bg-gradient-to-br from-secondary-800 to-secondary-900` + `particle-bg opacity-20` |
| レイアウト | タイムライン (縦方向)、カード間隔 `space-y-12` |

#### タイムライン表示
- **タイムラインライン** (md以上のみ表示):
  - 位置: `absolute left-4`
  - スタイル: `w-0.5 bg-gradient-to-b from-primary-400 to-purple-400`
  - モバイルでは非表示 (`hidden md:block`)
- **タイムラインドット** (md以上のみ表示):
  - 位置: `absolute left-2 top-8`
  - サイズ: `w-4 h-4`
  - スタイル: `bg-gradient-to-br from-primary-400 to-purple-400 rounded-full`
  - アニメーション: `animate-pulse`
- **キャリアカード**: `md:ml-12` で左マージン

#### CareerCard コンポーネント仕様

| 表示項目 | データソース | 表示形式 |
|----------|-------------|----------|
| プロジェクトタイトル | `career_title` | `text-xl font-semibold`、ホバーで `neon-text` |
| 期間 | `career_start`, `career_end` | `formatCareerPeriod()` で整形 (後述) |
| チーム規模 | `career_member` | アイコン付きテキスト |
| 説明 | `career_contents` | `text-sm text-secondary-200` |
| 技術スタック | `career_skill_stack[]` | `Badge` (variant: `secondary`, size: `sm`) |
| 担当フェーズ | `career_skill_phase[]` | `Badge` (variant: `outline`, size: `sm`) |
| 役割 | `career_role` | テキスト表示 |
| 現在バッジ | `career_end === 'now'` | 右上に "現在" Badge (`variant: accent`、`animate-pulse`) |

#### 日付フォーマットロジック (`formatCareerPeriod`)

```
入力: career_start = "YYYY年M月", career_end = "YYYY年M月" | "now"
処理:
  1. toDateString() で "YYYY年M月" -> "YYYY/MM/01" に変換
  2. Date オブジェクトから年月を取得
  3. end === "now" の場合: "YYYY年M月 - 現在"
  4. それ以外: "YYYY年M月 - YYYY年M月"
```

---

### 3.5 Skills Section

#### 機能概要
技術スキルをカードグリッドで表示するセクション。段階的にカードを表示する「もっと見る」機能を搭載。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 背景 | `bg-gradient-to-br from-secondary-900 to-secondary-800` + `mesh-background opacity-30` |
| グリッド | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`、`gap-6` |

#### ページネーション (スキル段階表示)

| 定数 | 値 | 説明 |
|------|----|------|
| `INITIAL_SKILLS_COUNT` | 9 | 初期表示枚数 |
| `SKILLS_INCREMENT` | 6 | 追加表示枚数 |

**表示ロジック:**
1. 初期状態: 先頭9枚のスキルカードを表示
2. "and more..." ボタンクリック: 6枚ずつ追加表示
3. 全カード表示後: ボタン非表示、`skills_more` テキストを表示

**アニメーション最適化:**
- `prevVisibleCountRef` (useRef) で前回表示数を追跡
- 新しく追加されたカードのみ `animate-fade-in-up` を適用
- 既存カードにはアニメーションを適用しない
- 各新規カードに `animationDelay: (index - prevVisibleCount) * 0.1s` でスタガー効果

#### SkillCard コンポーネント仕様

| 要素 | 仕様 |
|------|------|
| レイアウト | 横並び (`flex items-start space-x-4`) |
| アイコン | 48px x 48px、`rounded-lg`、グラデーション背景オーバーレイ |
| カード名 | `text-lg font-semibold`、ホバーで `neon-text` |
| 説明文 | `text-sm text-secondary-300` |
| ホバー効果 | `floating-card` (scale 1.02, shadow増加, -1px上移動)、下部にグラデーションライン出現 (`scale-x-0` -> `scale-x-100`) |

---

### 3.6 Contact Section

#### 機能概要
お問い合わせフォーム。Zod バリデーション + React Hook Form による入力制御。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 背景 | `bg-gradient-to-br from-secondary-800 to-secondary-900` + `particle-bg opacity-20` |
| フォーム幅 | `max-w-2xl` (672px) |
| フォームカード | `glass-card rounded-2xl p-8` |

#### フォームフィールド

| フィールド | ラベル | タイプ | プレースホルダー | バリデーション |
|-----------|--------|--------|-----------------|---------------|
| name | お名前 | text | "山田 太郎" | 必須、2~50文字 |
| email | メールアドレス | email | "example@email.com" | 必須、有効なメール形式、最大255文字 |
| message | お問い合わせ内容 | textarea (6行) | "お問い合わせ内容をご記入ください..." | 必須、10~2000文字 |

#### バリデーションルール (Zod スキーマ)

| フィールド | ルール | エラーメッセージ |
|-----------|--------|----------------|
| name | `.min(1)` | "お名前は必須です" |
| name | `.min(2)` | "お名前は2文字以上で入力してください" |
| name | `.max(50)` | "お名前は50文字以内で入力してください" |
| email | `.min(1)` | "メールアドレスは必須です" |
| email | `.email()` | "正しいメールアドレスを入力してください" |
| email | `.max(255)` | "メールアドレスは255文字以内で入力してください" |
| message | `.min(1)` | "お問い合わせ内容は必須です" |
| message | `.min(10)` | "お問い合わせ内容は10文字以上で入力してください" |
| message | `.max(2000)` | "お問い合わせ内容は2000文字以内で入力してください" |

#### サーバーサイドバリデーション (`POST /api/contact`)

| チェック | 条件 | ステータス | エラーメッセージ |
|---------|------|----------|----------------|
| 必須チェック | name, email, message いずれか空 | 400 | "すべての項目を入力してください" |
| メール形式 | 正規表現 `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | 400 | "有効なメールアドレスを入力してください" |
| メッセージ長 | `message.length > 5000` | 400 | "メッセージは5000文字以内で入力してください" |
| 送信失敗 | Resend API エラー | 500 | "メールの送信に失敗しました..." |
| サーバーエラー | 予期しない例外 | 500 | "サーバーエラーが発生しました..." |

#### 送信フロー

```
[送信ボタン押下]
  -> React Hook Form バリデーション (Zod)
  -> バリデーション失敗: フィールド下部にエラーメッセージ表示
  -> バリデーション成功:
    -> ボタン: ローディング状態 ("送信中..." + スピナー)
    -> POST /api/contact
    -> 成功: 送信完了画面 (チェックマークアイコン + メッセージ + "新しいお問い合わせ" ボタン)
    -> 失敗: エラーメッセージ表示 (glass-card, 赤ボーダー)
```

#### 送信完了画面
- チェックマークアイコン (`animate-bounce`)
- タイトル: "送信完了" (`neon-text`)
- メッセージ: "お問い合わせありがとうございます。確認次第、ご連絡させていただきます。"
- "新しいお問い合わせ" ボタン (variant: `outline`): フォーム状態をリセット

#### メール送信仕様
- 送信先: `process.env.MY_MAIL_ADDRESS`
- From: `process.env.RESEND_FROM_EMAIL`
- Reply-To: フォーム入力のメールアドレス
- 件名: `ポートフォリオサイトからのお問い合わせ - {name}様`
- 本文: HTML形式 + プレーンテキスト形式の両方
- タイムゾーン: `Asia/Tokyo`

---

### 3.7 Footer

#### 機能概要
ページ最下部のコピーライト表示。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 背景 | `bg-secondary-950` + グラデーションオーバーレイ (`from-primary-900/20 to-purple-900/20`) |
| パディング | `py-8` |
| テキスト | `footer_data.copyright` (データ駆動)、`text-secondary-400`、中央寄せ |

---

## 4. ユーザーフロー

### 4.1 ページ読み込みフロー

```
1. ユーザーがページにアクセス
2. ローディング状態を表示 (フルスクリーンスピナー)
   - スピナー: animate-spin, 128px, border-blue-600
   - テキスト: "Loading..."
3. GET /api/portfolio を fetch
4a. 成功: portfolioData をセット -> 全セクションをレンダリング
4b. 失敗: エラー画面を表示
   - テキスト: "Failed to load portfolio data" (赤)
   - "Reload Page" ボタン -> window.location.reload()
```

### 4.2 ナビゲーションフロー

```
[デスクトップ]
1. ヘッダーのナビ項目をクリック
2. scrollIntoView({ behavior: 'smooth' }) で対象セクションへ移動

[モバイル]
1. ハンバーガーメニューをタップ
2. ドロップダウンメニューが展開
3. ナビ項目をタップ
4. 対象セクションへスムーズスクロール
5. メニューが自動的に閉じる
```

### 4.3 スキル展開フロー

```
1. 初期表示: 9枚のスキルカード
2. "and more..." ボタンクリック
3. prevVisibleCountRef に現在の表示数を保存
4. visibleSkillsCount を +6 増加
5. 新しいカードが fade-in-up アニメーションで順次表示
   - 1枚目: delay 0s
   - 2枚目: delay 0.1s
   - 3枚目: delay 0.2s
   - ...
6. まだ未表示カードがあれば "and more..." ボタンを継続表示
7. 全カード表示後: skills_more テキストを表示
```

### 4.4 お問い合わせ送信フロー

```
1. フォームに入力
2. "上記内容で送信する" ボタンクリック
3. クライアントサイドバリデーション (Zod + React Hook Form)
   - 失敗: 各フィールド下にエラーメッセージ (赤テキスト)
   - 成功: 次のステップへ
4. ボタンがローディング状態に変化 (スピナー + "送信中...")
5. POST /api/contact へ送信
6. サーバーサイドバリデーション
7. Resend API でメール送信
8a. 成功: 送信完了画面を表示
8b. 失敗: エラーメッセージを表示 (glass-card, 赤枠)
9. "新しいお問い合わせ" ボタンでフォームをリセット
```

---

## 5. UI/UX仕様

### 5.1 レスポンシブブレークポイント

Tailwind CSS デフォルトブレークポイントを使用。

| ブレークポイント | 幅 | 主な適用箇所 |
|----------------|-----|-------------|
| デフォルト (モバイル) | < 640px | 1カラムレイアウト、ハンバーガーメニュー |
| `sm` | >= 640px | コンテナパディング変更 (`px-6`) |
| `md` | >= 768px | デスクトップナビ表示、2カラムグリッド、タイムライン表示 |
| `lg` | >= 1024px | 2カラムAboutレイアウト、3カラムスキルグリッド、ヘッダー高さ拡大 |
| `xl` | >= 1280px | 4カラムスキルグリッド |

### 5.2 コンテナ仕様

```css
.container {
  max-width: 80rem; /* 1280px (max-w-7xl) */
  margin: 0 auto;
  padding: 0 1rem;      /* デフォルト: 16px */
  /* sm: padding: 0 1.5rem; */ /* 24px */
  /* lg: padding: 0 2rem; */   /* 32px */
}
```

### 5.3 セクションパディング

```css
.section-padding {
  padding-top: 5rem;    /* 80px */
  padding-bottom: 5rem; /* 80px */
  /* lg: 8rem (128px) */
}
```

### 5.4 カラーシステム

| カテゴリ | 用途 | 基調色 |
|---------|------|--------|
| `primary` | メインアクセント、リンク、CTA | スカイブルー系 (#0ea5e9 / #38bdf8) |
| `secondary` | 背景、テキスト、ニュートラル | スレートグレー系 (#0f172a ~ #f8fafc) |
| `accent` | 成功状態、ハイライト | グリーン系 (#22c55e / #4ade80) |
| `purple` | セカンダリアクセント、グラデーション | パープル系 (#a855f7 / #c084fc) |

### 5.5 グラスモーフィズムデザイン

| クラス | 定義 | 用途 |
|--------|------|------|
| `glass-effect` | `bg-white/10 backdrop-blur-md border border-white/20` | ヘッダー、入力フィールド、Badge |
| `glass-card` | `bg-white/5 backdrop-blur-xl border border-white/10 shadow-glass` | カード、フォームコンテナ |

### 5.6 アニメーション一覧

| アニメーション名 | 動作 | 時間 | イージング |
|----------------|------|------|----------|
| `fade-in-up` | opacity 0->1, translateY 40px->0 | 0.8s | ease-out, both |
| `fade-in-down` | opacity 0->1, translateY -40px->0 | 0.8s | ease-out, both |
| `fade-in` | opacity 0->1 | 0.6s | ease-out, both |
| `slide-in-left` | opacity 0->1, translateX -50px->0 | 0.8s | ease-out, both |
| `slide-in-right` | opacity 0->1, translateX 50px->0 | 0.8s | ease-out, both |
| `float` | translateY 0 -> -20px -> 0 | 6s | ease-in-out, infinite |
| `glow` | box-shadow 明滅 (blue) | 2s | ease-in-out, infinite alternate |
| `gradientShift` | background-position 0%->100%->0% | 15s | ease, infinite |
| `bounce-slow` | Tailwind bounce | 3s | infinite |
| `pulse-slow` | Tailwind pulse | 3s | infinite |

### 5.7 インタラクション効果

| 効果 | クラス | 動作 |
|------|--------|------|
| フローティングカード | `floating-card` | hover: scale(1.02), shadow増加, translateY(-4px) |
| ネオンテキスト | `neon-text` | グラデーションテキスト + text-shadow |
| グローオンホバー | `glow-on-hover` | hover: neon shadow + scale(1.05) |
| ホバーリフト | `hover-lift` | hover: translateY(-8px) + shadow-2xl |
| 下部ラインアニメーション | カード内 | hover: scaleX(0) -> scaleX(1) グラデーションライン |

### 5.8 フォント

| フォント | 用途 | ウェイト |
|---------|------|---------|
| Inter | 英文テキスト (プライマリ) | 300~900 |
| Noto Sans JP | 日本語テキスト | 300~900 |
| JetBrains Mono / Fira Code | モノスペース (設定のみ) | - |

---

## 6. コンポーネント階層とデザインシステム

### 6.1 Atomic Design 構成

```
src/components/
  +-- atoms/          ... 最小単位のUIパーツ
  |   +-- Button.tsx
  |   +-- Input.tsx
  |   +-- TextArea.tsx
  |   +-- Badge.tsx
  +-- molecules/      ... Atoms を組み合わせた複合コンポーネント
  |   +-- SkillCard.tsx
  |   +-- CareerCard.tsx
  |   +-- SocialLinks.tsx
  +-- organisms/      ... ページの主要セクションを構成するコンポーネント
      +-- Header.tsx
      +-- ContactForm.tsx
```

### 6.2 Atoms

#### Button

| Props | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | 外観バリアント |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | サイズ |
| `isLoading` | `boolean` | `false` | ローディング状態 (スピナー表示 + disabled) |
| `children` | `ReactNode` | - | ボタンテキスト |

**サイズ:**
- `sm`: h-8, px-3, text-sm
- `md`: h-10, px-4, text-base
- `lg`: h-12, px-6, text-lg

**バリアント外観:**
- `primary`: グラデーション背景 (primary->purple)、ネオンシャドウホバー
- `secondary`: glass-effect、白テキスト
- `outline`: glass-effect + primary ボーダー、ネオンシャドウホバー
- `ghost`: 透明背景、ホバーで白/10背景

**共通:** `rounded-xl`, `font-semibold`, `focus-visible:ring-2`, `disabled:opacity-50`, `hover:scale-105`

#### Input

| Props | 型 | 説明 |
|-------|-----|------|
| `label` | `string?` | ラベルテキスト (required時に赤アスタリスク表示) |
| `error` | `string?` | エラーメッセージ (赤テキスト、エラー時ボーダー赤) |
| `hint` | `string?` | ヒントテキスト (エラー非表示時のみ表示) |

**スタイル:** `glass-effect`, `rounded-xl`, `px-4 py-3`, `text-sm`, エラー時: 赤ボーダー + 赤フォーカスリング

#### TextArea

Input と同等のインターフェース。追加で `min-h-[120px]`, `resize-y` を適用。

#### Badge

| Props | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| `variant` | `'default' \| 'secondary' \| 'accent' \| 'outline'` | `'default'` | 外観バリアント |
| `size` | `'sm' \| 'md'` | `'md'` | サイズ |

**サイズ:**
- `sm`: px-2, py-0.5, text-xs
- `md`: px-2.5, py-0.5, text-sm

**共通:** `rounded-full`, `font-medium`, `hover:scale-105`

### 6.3 Molecules

#### SkillCard

| Props | 型 | 説明 |
|-------|-----|------|
| `name` | `string` | スキル名 |
| `description` | `string` | 説明テキスト |
| `iconUrl` | `string` | アイコン画像URL |
| `className` | `string?` | 追加CSSクラス (アニメーション用) |
| `style` | `CSSProperties?` | インラインスタイル (animationDelay用) |

#### CareerCard

| Props | 型 | 説明 |
|-------|-----|------|
| `title` | `string` | プロジェクトタイトル |
| `period` | `string` | 期間テキスト (フォーマット済み) |
| `teamSize` | `string` | チーム規模 |
| `description` | `string` | 説明 |
| `techStack` | `string[]` | 技術スタック (Badge表示) |
| `phases` | `string[]` | 担当フェーズ (Badge表示) |
| `role` | `string` | 役割 |
| `isCurrent` | `boolean?` | 現在進行中フラグ |

**カード内セクション構成:**
1. タイトル + 期間 + チーム規模
2. 区切り線 (グラデーション)
3. 説明文
4. 技術スタック (Badge群)
5. 担当フェーズ (Badge群)
6. 役割

#### SocialLinks

| Props | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| `links` | `SNSItem[]` | - | SNSリンクデータ配列 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | アイコンサイズ |

**サイズ:**
- `sm`: 24px x 24px
- `md`: 32px x 32px
- `lg`: 40px x 40px

### 6.4 Organisms

#### Header
ナビゲーション + モバイルメニューの複合コンポーネント (詳細は 3.1 節参照)。

#### ContactForm
フォーム入力 + バリデーション + API送信 + 状態管理の複合コンポーネント (詳細は 3.6 節参照)。

---

## 7. ビジネスロジック

### 7.1 日付変換 (`toDateString`)

```
入力: "YYYY年M月" または "YYYY年MM月"
正規表現: /(\d{4})年(\d{1,2})月/
出力: "YYYY/MM/01"
例: "2024年3月" -> "2024/03/01"
不正入力: Error("Invalid format: ...") をスロー
```

### 7.2 経歴期間フォーマット (`formatCareerPeriod`)

```
入力: start = "YYYY年M月", end = "YYYY年M月" | "now"
処理:
  1. toDateString() で日付文字列に変換
  2. Date オブジェクトを生成 (end="now" の場合は new Date())
  3. 年月を抽出
出力:
  - end="now": "YYYY年M月 - 現在"
  - それ以外: "YYYY年M月 - YYYY年M月"
```

### 7.3 スキルページネーション

```
状態:
  - visibleSkillsCount: number (初期値: 9)
  - prevVisibleCountRef: useRef<number> (初期値: 0)

表示スキル = skills_cards.slice(0, visibleSkillsCount)
残りあり = visibleSkillsCount < skills_cards.length

showMoreSkills():
  1. prevVisibleCountRef.current = visibleSkillsCount
  2. visibleSkillsCount += 6

新規カード判定: index >= prevVisibleCountRef.current
アニメーション遅延: (index - prevVisibleCountRef.current) * 0.1s
```

### 7.4 フォームバリデーション

**クライアントサイド (Zod + React Hook Form):**
- `zodResolver(ContactFormSchema)` による送信時バリデーション
- `useForm` は `mode` 未指定のため、デフォルトの `onSubmit` モードで動作
- 初回送信時に全フィールドバリデーション実行。初回送信後はフィールド変更時に再検証（React Hook Form のデフォルト挙動）
- `handleSubmit` 内で Zod スキーマによる検証が通った場合のみ送信処理を実行

**サーバーサイド (API Route):**
- 必須フィールドチェック
- メールアドレス正規表現チェック
- メッセージ長上限チェック (5000文字 -- クライアントの2000文字より緩い)

### 7.5 データ取得戦略

```
本番環境:
  GCS バケット -> JSON パース -> レスポンス返却

開発環境:
  1. sample.json が存在 && FORCE_GCS 未設定: sample.json を使用
  2. それ以外: GCS から取得
  3. GCS 失敗時: sample.json にフォールバック (存在する場合)
  ※ 注意: sample.json はリポジトリに含まれていないため、
     fresh checkout では 1. と 3. は成立しない。実質 GCS 必須。

キャッシュ制御:
  Cache-Control: public, s-maxage=300, stale-while-revalidate=86400
  (CDN キャッシュ: 5分、stale利用: 24時間)
```

---

## 8. 型定義

### 8.1 ポートフォリオデータ型

```typescript
PortfolioData
  +-- navbar_data: NavbarData
  |     link_title, about_name, career_name, skills_name, contact_name
  +-- hero_data: HeroData
  |     hero_img_url
  +-- about_data: AboutData
  |     about_name, about_icon_url, about_img_url, sns_list: SNSItem[], about_contents: string[]
  +-- career_title_data: CareerTitleData  ※ 型定義のみ。UIでは未使用（ラベルはハードコード）
  |     career_title_period, career_title_member, career_title_contents,
  |     career_title_stack, career_title_phase, career_title_role
  +-- career_data: CareerData[]
  |     career_title, career_start, career_end, career_member,
  |     career_contents, career_skill_stack[], career_skill_phase[], career_role
  +-- skills_data: SkillsData
  |     skills_cards: SkillCard[], skills_more
  +-- contact_data: ContactData           ※ 型定義のみ。UIでは未使用（文言はハードコード）
  |     contact_name, contact_email, contact_contents, contact_btn_name
  +-- footer_data: FooterData
        copyright
```

### 8.2 SNSItem

```typescript
interface SNSItem {
  sns_name: string;   // SNS名 (例: "GitHub")
  sns_url: string;    // プロフィールURL
  sns_img: string;    // アイコン画像URL
}
```

### 8.3 お問い合わせフォーム型

```typescript
interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
```

---

## 9. API仕様

### 9.1 GET /api/portfolio

| 項目 | 内容 |
|------|------|
| メソッド | GET |
| 認証 | 不要 |
| レスポンス (成功) | `200 OK` + `PortfolioData` JSON |
| レスポンス (失敗) | `500` + `{ error, details, timestamp }` |
| キャッシュ | `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400` |

### 9.2 POST /api/contact

| 項目 | 内容 |
|------|------|
| メソッド | POST |
| Content-Type | application/json |
| 認証 | 不要 |
| リクエストボディ | `{ name: string, email: string, message: string }` |
| レスポンス (成功) | `200 OK` + `{ success: true, message: string, messageId: string }` |
| レスポンス (バリデーションエラー) | `400` + `{ error: string }` |
| レスポンス (サーバーエラー) | `500` + `{ error: string }` |

---

## 10. SEO / メタデータ

| 項目 | 値 |
|------|-----|
| title | "TechProfile Pro - フリーランスエンジニア" |
| description | "フリーランスエンジニアのポートフォリオサイト" |
| lang | `ja` |
| OG type | website |
| OG locale | ja_JP |
| Twitter card | summary_large_image |
| robots | index, follow |
| googleBot | index, follow, max-video-preview: -1, max-image-preview: large, max-snippet: -1 |

---

## 11. 環境変数

| 変数名 | 用途 | 必須 |
|--------|------|------|
| `RESEND_API_KEY` | Resend API キー (re_ プレフィックス) | 本番: 必須 |
| `RESEND_FROM_EMAIL` | メール送信元アドレス | 本番: 必須 |
| `MY_MAIL_ADDRESS` | お問い合わせ通知先メールアドレス | 本番: 必須 |
| `GCS_PRIVATE_BUCKET_NAME` | GCS バケット名 | 本番: 必須 (デフォルト: `intro_k_pri_bucket`) |
| `GCS_JSON_PATH` | GCS 内JSONファイルパス | 本番: 必須 (デフォルト: `json/navbar_intro.json`) |
| `GOOGLE_APPLICATION_CREDENTIALS` | GCP サービスアカウントキーファイルパス | 開発: 任意 |
| `GOOGLE_CLOUD_PROJECT_ID` | GCP プロジェクトID | 開発: 任意 |
| `GOOGLE_CLOUD_PRIVATE_KEY` | GCP サービスアカウント秘密鍵 | 実質未使用（`NODE_ENV` が `production`/`development` 以外の場合のみ到達するデッドコード分岐） |
| `GOOGLE_CLOUD_CLIENT_EMAIL` | GCP サービスアカウントメール | 同上 |
| `FORCE_GCS` | 開発環境でも GCS を使用するフラグ | 開発: 任意 |

---

## 12. ユーティリティ

### 12.1 cn (クラス名マージ)

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`clsx` で条件付きクラス名を結合し、`tailwind-merge` で Tailwind CSS クラスの競合を解決する。全コンポーネントで使用。
