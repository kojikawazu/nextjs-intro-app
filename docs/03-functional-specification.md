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
        - [テーマトグル](#テーマトグル)
    - [3.2 Hero Section](#32-hero-section)
        - [機能概要](#機能概要-1)
        - [仕様詳細](#仕様詳細-1)
        - [構成](#構成)
        - [何ができる人かを示す](#何ができる人かを示す)
        - [Hero から削除したもの](#hero-から削除したもの)
        - [数値帯の罫線](#数値帯の罫線)
        - [アニメーション](#アニメーション)
    - [3.3 About Section](#33-about-section)
        - [機能概要](#機能概要-2)
        - [仕様詳細](#仕様詳細-2)
        - [左カラム (プロフィール画像 + SNS)](#左カラム-プロフィール画像--sns)
        - [右カラム (テキスト)](#右カラム-テキスト)
    - [3.4 Career Section](#34-career-section)
        - [機能概要](#機能概要-3)
        - [仕様詳細](#仕様詳細-3)
        - [進行中と過去の重み付け](#進行中と過去の重み付け)
        - [CareerCard コンポーネント仕様](#careercard-コンポーネント仕様)
        - [技術スタックの表示](#技術スタックの表示)
        - [日付フォーマットロジック (`formatCareerPeriod`)](#日付フォーマットロジック-formatcareerperiod)
    - [3.5 Contact Section](#35-contact-section)
        - [機能概要](#機能概要-4)
        - [仕様詳細](#仕様詳細-4)
        - [フォームフィールド](#フォームフィールド)
        - [バリデーションルール (Zod スキーマ)](#バリデーションルール-zod-スキーマ)
        - [サーバーサイドバリデーション (`POST /api/contact`)](#サーバーサイドバリデーション-post-apicontact)
        - [送信フロー](#送信フロー)
        - [送信完了画面](#送信完了画面)
        - [メール送信仕様](#メール送信仕様)
    - [3.6 Footer](#36-footer)
        - [機能概要](#機能概要-5)
        - [仕様詳細](#仕様詳細-5)
- [4. ユーザーフロー](#4-ユーザーフロー)
    - [4.1 ページ読み込みフロー](#41-ページ読み込みフロー)
    - [4.2 ナビゲーションフロー](#42-ナビゲーションフロー)
    - [4.3 お問い合わせ送信フロー](#43-お問い合わせ送信フロー)
    - [4.4 テーマ切り替えフロー](#44-テーマ切り替えフロー)
- [5. UI/UX仕様](#5-uiux仕様)
    - [5.1 レスポンシブブレークポイント](#51-レスポンシブブレークポイント)
    - [5.2 コンテナ仕様](#52-コンテナ仕様)
    - [5.3 セクションパディング](#53-セクションパディング)
    - [5.4 カラーシステム](#54-カラーシステム)
    - [5.5 ライト / ダークテーマ](#55-ライト--ダークテーマ)
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
        - [ThemeToggle](#themetoggle)
    - [6.3 Molecules](#63-molecules)
        - [CareerCard](#careercard)
        - [SocialLinks](#sociallinks)
    - [6.4 Organisms](#64-organisms)
        - [Header](#header)
        - [ContactForm](#contactform)
- [7. ビジネスロジック](#7-ビジネスロジック)
    - [7.1 日付変換 (`toDateString`)](#71-日付変換-todatestring)
    - [7.2 経歴期間フォーマット (`formatCareerPeriod`)](#72-経歴期間フォーマット-formatcareerperiod)
    - [7.3 技術スタックの分類 (`groupTechStack`)](#73-技術スタックの分類-grouptechstack)
    - [7.4 経歴サマリの集計 (`summarizeCareers`)](#74-経歴サマリの集計-summarizecareers)
    - [7.5 フォームバリデーション](#75-フォームバリデーション)
    - [7.6 データ取得戦略](#76-データ取得戦略)
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

```text
page.tsx (クライアントコンポーネント)
  +-- Header (固定ヘッダー)
  +-- Hero Section
  +-- About Section
  +-- Career Section
  +-- Contact Section
  +-- Footer
```

### 2.2 データフロー

```text
[Google Cloud Storage] -- JSON --> [page.tsx (Server Component)] --> [client.tsx] --> 本文入り HTML
[ContactForm] -- POST /api/contact --> [Resend API] --> メール送信
```

1. ページ読み込み時、`page.tsx`（Server Component）が**サーバー側で**ポートフォリオデータを取得し、`client.tsx` に渡して HTML を生成する。ブラウザは本文を含む HTML を受け取る。
2. 本番環境では GCS バケットからJSONファイルを取得する。開発環境では `sample.json` へのフォールバックロジックが存在するが、`sample.json` はリポジトリに含まれていないため、実質的に GCS 接続が必要。
3. 取得に失敗した場合は例外が伝播し、`error.tsx` のエラーバウンダリが描画される。
4. `GET /api/portfolio` は BFF の公開 I/F として維持しているが、**本ページはこれを経由しない**。
5. お問い合わせフォームは `POST /api/contact` 経由で Resend API を使用してメール送信を行う。

---

## 3. セクション別機能仕様

### 3.1 Header / ナビゲーション

#### 機能概要

ページ上部のヘッダー。**スクロール追従をやめ、地の流れに置いた**（issue #138）。書類として読ませる設計では本文に被る要素が邪魔になるため。併せてスクロール量の監視も不要になった。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 配置 | 通常フロー（`fixed` ではない） |
| 高さ | `h-16` (64px) |
| 区切り | 下罫 (`border-b border-rule`) |
| 構成 | ロゴ（明朝）/ ナビ / テーマトグル / ハンバーガー |

#### デスクトップナビゲーション (md以上)

- ナビ項目: About, Career, Contact（`navbar_data` から取得）
- **`<button>` を維持する。** `e2e/home.spec.ts` と `e2e/security.spec.ts` が `getByRole('button', { name: 'Contact' })` でハイドレーション完了を確認しており、`<a>` に変えると JS を実行しなくても遷移してしまい確認の意味が失われる（issue #131 で一度壊した箇所）
- クリック時: 対応セクションへスムーズスクロール（`prefers-reduced-motion` 時は即時）
- ホバー: 文字色を `--mute` から `--ink` へ
- 項目が 6 件（#127〜#129 の追加後）に増えても収まる幅で組む

#### モバイルナビゲーション (md未満)

- ハンバーガーメニューボタン（開閉で形状変化）
- `aria-label="メニューを開く"` / `aria-expanded` によるアクセシビリティ対応
- 開閉状態: `isMobileMenuOpen` state で管理
- ナビ項目クリック時: セクションへスクロール後、メニュー自動閉じ

#### テーマトグル

ヘッダー右端。詳細は §5.5。

---

### 3.2 Hero Section

#### 機能概要

**見出し → 具体 → 数値帯**の 3 段のみ。フルスクリーンの演出をやめ、書類の冒頭として組んだ。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 高さ | 内容に応じる（`min-h-screen` は使わない） |
| レイアウト | 左揃え 1 カラム |
| 背景 | 地の色（`--paper`）のみ。画像・グラデーション・パーティクルはすべて廃止 |

#### 構成

| 段 | 内容 | 出どころ |
|---|------|---------|
| 見出し | `Solving Problems with Technology` | コードの固定文字列（**変更なし**） |
| 具体 | 「専門はバックエンド開発。…要件定義(検討)から設計、実装、テスト設計、レビューまでの一連の流れを経験しております。」 | `about_data.about_contents[1]` を **About から移動** |
| 数値帯 | プロジェクト数 / 使用技術数 / 経歴開始年 | `career_data` から算出（`summarizeCareers`） |

**見出しは `<br />` で折らない。** テキストノードが分かれると見出しのアクセシブル名が `Solving Problemswith Technology` になりうる。折り返しは `max-w-[17ch]` で作る。

#### 何ができる人かを示す

現行の見出しは「何ができる人か」を述べておらず、書体と余白では解けない。`about_contents[1]` がすでにその答えを書いていたため、**新規コピーを書かず既存データの再配置**で解いた（issue #135）。

#### Hero から削除したもの

| 削除 | 理由 |
|------|------|
| 「テクノロジーを使って、お客様の課題解決を実現します」 | 直下に置いた `about_contents[1]` と同じことを抽象的に言っているだけで、具体の直前に置くと弱める |
| 「お問い合わせ」ボタン | 書類として読ませる設計に CTA が馴染まない。Contact へはヘッダーと末尾から到達できる |

#### 数値帯の罫線

**縦罫は引かない。** 等分した列（本文幅 896px / 3 = 約 277px）に対し中身は数十 px しかなく、縦罫が中身から 200px 離れて「何を区切っているのか」が読めない線になる。上下の罫線と余白だけで 3 つの数値は分かれて読める。

セル内側の余白も持たせない。持たせると先頭の数値が本文マージンから内側へずれ、見出し・引用・下のセクション見出しと左端の縦ラインが通らなくなる。

#### アニメーション

コンテンツ全体に `animate-fade-in-up`（0.5 秒、12px 上方向から）。**初回表示の 1 回のみ**で、常時動くものは無い。

---

### 3.3 About Section

#### 機能概要

プロフィール画像・SNS リンク・自己紹介文。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 背景 | 地の色のみ |
| パディング | `section-padding` (py-8 / lg:py-10) |
| レイアウト | `sm` 以上で 2 カラム（`sm:grid-cols-[8rem_1fr]`）、未満は 1 カラム |
| 区切り | **見出し横の罫線のみ。** `<section>` に上罫を足すと横罫が 2 本並び、どちらが区切りか読めなくなる |

#### 左カラム (プロフィール画像 + SNS)

- **プロフィール画像**: 128px 角、角丸 2px、`border border-rule`。円形・グロー・画像加工（`brightness` / `contrast` / `saturate`）はすべて廃止
- **氏名ラベルは表示しない。** 写真の直下に名前を再掲する必要がない。`about_name` は画像の `alt` として残るため情報は失われない
- **SNS リンク**（`SocialLinks`）: **アイコン画像ではなく `sns_name` のテキストチップ**。`sns_img` が指す SVG は白一色で、紙のような明るい地の上では見えなくなるため（データは変更しない方針）。結果として `sns_img` は画面から参照されなくなる

#### 右カラム (テキスト)

- セクションタイトル: `navbar_data.about_name`
- 本文: `about_contents` のうち **`[1]` を除く全段落**（`[1]` は Hero へ移動済み）

---

### 3.4 Career Section

#### 機能概要

経歴を縦に並べる。**タイムラインの縦線・ドットは廃止**し、案件ごとの左罫で区切る。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 背景 | 地の色のみ |
| レイアウト | 縦 1 列、カード間隔 `gap-10` |
| 見出し右 | 件数（`career_data.length`）を等幅で表示 |

#### 進行中と過去の重み付け

全 7 件が等価に並ぶと、直近の案件と 2015 年の業務が同じ重さで読まれる（issue #135 の弱点(4)）。

| 状態 | 左罫 | 「現在」バッジ |
|------|------|--------------|
| 進行中 (`career_end === 'now'`) | `--acc`（アクセント色） | あり |
| 過去 | `--rule`（地の罫線色） | なし |

#### CareerCard コンポーネント仕様

| 表示項目 | データソース | 表示形式 |
|----------|-------------|----------|
| プロジェクトタイトル | `career_title` | `text-base font-bold` |
| 期間・チーム規模 | `career_start`, `career_end`, `career_member` | 等幅 1 行（`formatCareerPeriod()` で整形） |
| 説明 | `career_contents` | 本文 |
| 技術スタック | `career_skill_stack[]` | **分類ごとにまとめ、技術は 1 件ずつチップ**（後述） |
| 担当フェーズ | `career_skill_phase[]` | 中黒区切りの 1 行 |
| 役割 | `career_role` | 本文 |
| 現在バッジ | `career_end === 'now'` | タイトル横に `Badge`（アクセント色） |

#### 技術スタックの表示

1 案件あたり最大 30 件がフラットに並ぶと、読み手が信号（言語・フレームワーク・テスト）とノイズ（協働ツール）を自力で分離しなければならない。最新案件の 29 件のうち 10 件は協働ツールだった。

- **分類ごとにまとめる**（`groupTechStack`、issue #137）。分類の定義は `docs/05-data-specification.md` §5.4
- **中身のある分類だけを出す。** 案件ごとに登場する分類が違う（最新案件には `OS・ミドルウェア` が 1 件しかなく、PC 基盤の案件には `テスト` と `設計` が 1 件も無い）
- **技術は 1 件ずつチップにする。** 読点で連ねると「文章」として読まれ、個々の技術を拾い読みできない
- チップは等幅にしない。`C言語` `グラフィックMW` のように日本語を含む技術名があり、等幅フォントにグリフが無いと字形が混ざる
- チップは枠線ではなく地色（`--panel`）で塗る。30 個並んだときに枠線だと線が主張しすぎる。背景は装飾でありコントラスト要件の対象外（文字は `--body` on `--panel` で 11.3:1 以上）
- 対応表に無い技術は **「その他」として画面に出す**。黙って隠すとデータ追加時の取りこぼしに永久に気づけない

#### 日付フォーマットロジック (`formatCareerPeriod`)

```text
入力: career_start = "YYYY年M月", career_end = "YYYY年M月" | "now"
処理:
  1. toDateString() で "YYYY年M月" -> "YYYY/MM/01" に変換
  2. Date オブジェクトから年月を取得
  3. end === "now" の場合: "YYYY年M月 - 現在"
  4. それ以外: "YYYY年M月 - YYYY年M月"
```

---

### 3.5 Contact Section

#### 機能概要

お問い合わせフォーム。Zod バリデーション + React Hook Form による入力制御。

#### 仕様詳細

| 項目 | 仕様 |
|------|------|
| 背景 | `--paper`（他セクションと共通。Contact だけ地色を変えない） |
| 見出し | `.section-heading`（`h2` + `hr`）+ リード文「お気軽にお問い合わせください」 |
| フォーム幅 | `.container`（`max-w-4xl` = 896px）に従う。フォーム自体に幅指定は持たない |
| フォーム | カード化しない。`space-y-4` で項目を縦に積むだけの素の `<form>` |

> 旧デザインはグラデーション背景の上に `glass-card` を浮かべていたが、**書類として読ませる設計では
> Contact だけ別レイヤーに浮くと流れが切れる**ため、地の紙面にそのまま置く形へ変更した（issue #138）。

#### フォームフィールド

| フィールド | ラベル | タイプ | プレースホルダー | バリデーション |
|-----------|--------|--------|-----------------|---------------|
| name | お名前 | text | "山田 太郎" | 必須、2~50文字 |
| email | メールアドレス | email | "<example@email.com>" | 必須、有効なメール形式、最大255文字 |
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

> **`必須` と `メール形式` のメッセージはクライアントでは表示されない。** 各項目に `required` /
> `type="email"` を付けているため、空欄と不正なメール形式は**ブラウザのネイティブ検証が
> submit 自体を止め**、react-hook-form の `handleSubmit` まで到達しない。上表のうち
> クライアントで実際に見えるのは `min(2)` / `min(10)` / `max(...)` のメッセージで、
> `min(1)` と `.email()` が効くのはサーバー側（下記）である。
> 検証は `src/components/organisms/ContactForm.test.tsx` と `e2e/contact.spec.ts`。

#### サーバーサイドバリデーション (`POST /api/contact`)

| チェック | 条件 | ステータス | エラーメッセージ |
|---------|------|----------|----------------|
| 必須チェック | name, email, message いずれか空 | 400 | "すべての項目を入力してください" |
| メール形式 | 正規表現 `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | 400 | "有効なメールアドレスを入力してください" |
| メッセージ長 | `message.length > 5000` | 400 | "メッセージは5000文字以内で入力してください" |
| 送信失敗 | Resend API エラー | 500 | "メールの送信に失敗しました..." |
| サーバーエラー | 予期しない例外 | 500 | "サーバーエラーが発生しました..." |

#### 送信フロー

```text
[送信ボタン押下]
  -> React Hook Form バリデーション (Zod)
  -> バリデーション失敗: フィールド下部にエラーメッセージ表示
  -> バリデーション成功:
    -> ボタン: ローディング状態 ("送信中..." + スピナー)
    -> POST /api/contact
    -> 成功: 送信完了画面 (チェックマークアイコン + メッセージ + "新しいお問い合わせ" ボタン)
    -> 失敗: エラーメッセージ表示 (`border-l-2 border-warn bg-panel`, 文字色 `--warn`)
```

#### 送信完了画面

- パネル: `.quote-panel`（Hero の引用パネルと同じ体裁）
- タイトル: "送信完了"（`font-serif`）
- メッセージ: "お問い合わせありがとうございます。確認次第、ご連絡させていただきます。"
- "新しいお問い合わせ" ボタン (variant: `outline`, size: `sm`): フォーム状態をリセット

> アイコンと `animate-bounce` は廃止した。**完了は文言で足りており**、装飾のための
> 独自アニメーションは `prefers-reduced-motion` の考慮対象を増やすだけだった（issue #138）。
> `role="status"` / `aria-live="polite"` は維持している。

#### メール送信仕様

- 送信先: `process.env.MY_MAIL_ADDRESS`
- From: `process.env.RESEND_FROM_EMAIL`
- Reply-To: フォーム入力のメールアドレス
- 件名: `ポートフォリオサイトからのお問い合わせ - {name}様`
- 本文: HTML形式 + プレーンテキスト形式の両方
- タイムゾーン: `Asia/Tokyo`

---

### 3.6 Footer

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

```text
1. ユーザーがページにアクセス
2. サーバー側で page.tsx がポートフォリオデータを取得
3a. 成功: client.tsx に渡して描画 -> 全セクションを含む HTML を返す
    - ブラウザはローディング表示を経ずに本文を表示する
    - ハイドレーション後に Header のモバイルメニューやフォーム入力などの対話が有効になる
3b. 失敗: error.tsx のエラーバウンダリを描画
    - テキスト: "Failed to load portfolio data" (`--warn`)
    - "Try Again" ボタン -> reset()（セグメントの再レンダリング）
    - "Reload Page" ボタン -> window.location.reload()
```

> **旧フロー（〜2026-09-19）**: ページ全体が Client Component で、フルスクリーンスピナーを
> 表示してから `useEffect` で `GET /api/portfolio` を呼んでいた。初期 HTML には
> `Loading...` の 10 文字しか含まれず、JS を実行しないクローラからは本文が見えなかった。

### 4.2 ナビゲーションフロー

```text
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

### 4.3 お問い合わせ送信フロー

```text
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
8b. 失敗: エラーメッセージを表示 (左罫 `--warn` + `--panel` の地)
9. "新しいお問い合わせ" ボタンでフォームをリセット
```

### 4.4 テーマ切り替えフロー

```text
[初回訪問（Cookie なし）]
1. layout.tsx が theme Cookie を読む -> 無いので data-theme を出さない
2. ブラウザが prefers-color-scheme に従って配色を決める（globals.css の @media ブロック）

[切り替え]
1. ヘッダーのテーマトグルで「ライト」/「ダーク」を押す
2. <html> の data-theme を書き換える -> 再描画なしで即座に配色が変わる
3. 同じ値を theme Cookie（Max-Age 1年, SameSite=Lax）へ保存

[再訪問（Cookie あり）]
1. layout.tsx が Cookie を読み、<html data-theme="..."> を付けて HTML を返す
2. 初期 HTML の時点で配色が確定しているため、ちらつき（FOUC）が起きない
```

> **インラインスクリプトを使わない理由**: テーマ復元の定番は `<head>` に同期スクリプトを
> 置く方法だが、本サイトの CSP は `script-src` を nonce + `strict-dynamic` で絞っており、
> インラインスクリプトと相性が悪い。Cookie をサーバーで読む方式なら JS を 1 行も足さずに
> 同じ結果が得られる（`docs/09-architecture-specification.md` §6.7）。

---

## 5. UI/UX仕様

> デザイン刷新（issue #135 / #138）で全面的に入れ替わった。旧デザイン（グラスモーフィズム + ネオン）の記述は残していない。

### 5.1 レスポンシブブレークポイント

Tailwind CSS デフォルトブレークポイントを使用。

| ブレークポイント | 幅 | 主な適用箇所 |
|----------------|-----|-------------|
| デフォルト (モバイル) | < 640px | 1カラムレイアウト、ハンバーガーメニュー |
| `sm` | >= 640px | コンテナパディング変更 (`px-8`)、About の 2 カラム化、Hero 見出しの拡大 |
| `md` | >= 768px | デスクトップナビ表示 |
| `lg` | >= 1024px | セクションパディング拡大 |

### 5.2 コンテナ仕様

```css
.container {
  max-width: 56rem; /* 896px (max-w-4xl) */
  margin: 0 auto;
  padding: 0 1.25rem;      /* デフォルト: 20px */
  /* sm: padding: 0 2rem; */ /* 32px */
}
```

**旧デザインの `max-w-7xl`（1280px）から狭めた。** 書類として読ませる設計では 1 行が長すぎると視線が行末から次の行頭へ戻れない。

### 5.3 セクションパディング

```css
.section-padding {
  padding-top: 2rem;    /* 32px */
  padding-bottom: 2rem; /* 32px */
  /* lg: 2.5rem (40px) */
}
```

上下が接するため、**セクション間の空きはこの 2 倍**（モバイル 64px / lg 80px）になる。

**セクション内の最大の空き（経歴カード間 40px）の 2 倍に揃えている。** 空きが
`12px（段落）→ 28px（グリッド行）→ 40px（カード）→ 80px（セクション）` と倍で積み上がり、
どこが切れ目かを空き幅だけで読み取れる。

> 当初は `py-14 / lg:py-20`（セクション間 160px）としていたが、カード間の 4 倍あり、
> Hero の数値帯から About 見出しまで 176px の空白が生まれていた。見出し横の罫線が
> 区切りの仕事をしているため、それだけ空けても間延びするだけだった（issue #145）。

Hero だけは `py-10 / lg:py-14`（40 / 56px）と 1 段広い。先頭であり、ヘッダーの罫線と
詰めると見出しが貼り付いて見えるため。

### 5.4 カラーシステム

**固定色のパレットを廃止し、CSS 変数のトークンに置き換えた。** `tailwind.config.js` の色はすべて `var(--*)` を指す。定義と実測コントラスト比は `src/app/globals.css` と `docs/04-non-functional-specification.md` §5.2 を参照。

| トークン | 用途 |
|---------|------|
| `--paper` | 地 |
| `--ink` | 見出し・強調 |
| `--body` | 本文 |
| `--lead` | リード文 |
| `--mute` | 補助・ラベル |
| `--rule` | 装飾的な区切り線（コントラスト要件なし） |
| `--field` | 入力欄・トグルなど**操作できる部品の境界**（3:1 以上） |
| `--panel` | 面（引用・入力欄の背景） |
| `--acc` | アクセント |
| `--acc-on` | アクセント上の文字 |
| `--warn` | 注意表示・入力エラー |

**透過度の修飾子（`text-ink/50` 等）は使えない。** Tailwind が `rgb(var(--x) / <alpha-value>)` の形を要求するのに対し、トークンは hex / oklch の完成した色だからである。濃淡が要る箇所は専用トークンを足す。

### 5.5 ライト / ダークテーマ

利用者が選べる。既定は OS の `prefers-color-scheme` に従い、明示的に選んだ場合は Cookie に保存してサーバー側の初期 HTML へ反映する（ちらつきなし）。機構の詳細は `docs/09-architecture-specification.md` §6.7。

| 操作 | 位置 | 実装 |
|------|------|------|
| テーマトグル | ヘッダー右端 | `src/components/atoms/ThemeToggle.tsx` |

**選択中かどうかの表示は JS ではなく CSS が決める。** Cookie 未設定時はサーバーが `data-theme` を出さないため、React の state で持つと初期描画時点では正解が分からず、ハイドレーション不一致か一瞬のちらつきのどちらかが必ず起きる。

**トグル 1 個ではなくボタン 2 個**にしている。1 個にすると「いまどちらか」を `aria-pressed` で伝える必要があり、同じ理由で初期値を決められない。

### 5.6 アニメーション一覧

**装飾のための常時アニメーションを全廃した。** 書類として読ませる設計に、動き続ける要素は馴染まない。

| アニメーション名 | 動作 | 時間 | 適用箇所 |
|----------------|------|------|---------|
| `fade-in-up` | opacity 0->1, translateY 12px->0 | 0.5s | Hero（初回表示の 1 回のみ） |

`prefers-reduced-motion: reduce` の環境では、アニメーション・トランジション・スムーススクロールをすべて無効化する（`globals.css`）。

### 5.7 インタラクション効果

| 効果 | 動作 |
|------|------|
| ナビ / リンクのホバー | 文字色を `--mute` から `--ink` へ |
| ボタン（primary）のホバー | 不透明度 90% |
| ボタン（outline）のホバー | 背景を `--panel` へ |
| フォーカス | `--acc` の 2px リング。primary ボタンは地と同化しないよう `ring-offset` を挟む |

拡大・浮き上がり・影の増減といった効果は使わない。

### 5.8 フォント

| フォント | 用途 | ウェイト |
|---------|------|---------|
| Zen Old Mincho | 見出し（`font-serif`）。英語見出しも明朝で組む | 400 / 600 / 700 |
| Zen Kaku Gothic New | 本文（`font-sans`） | 400 / 500 / 700 |
| ui-monospace ほかシステム等幅 | 期間・件数・SNS 名など（`font-mono`） | - |

日本語フォントは Google Fonts の unicode-range 分割に載せる。**`next/font` は使わない**（日本語のサブセット指定ができず全字形を取得するため）。CSP は `style-src` / `font-src` で両ドメインを許可済み。

---

## 6. コンポーネント階層とデザインシステム

### 6.1 Atomic Design 構成

```text
src/components/
  +-- atoms/          ... 最小単位のUIパーツ
  |   +-- Button.tsx
  |   +-- Input.tsx
  |   +-- TextArea.tsx
  |   +-- Badge.tsx
  +-- molecules/      ... Atoms を組み合わせた複合コンポーネント
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
| `variant` | `'primary' \| 'outline' \| 'ghost'` | `'primary'` | 外観バリアント |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | サイズ |
| `isLoading` | `boolean` | `false` | ローディング状態 (スピナー表示 + disabled) |
| `children` | `ReactNode` | - | ボタンテキスト |

**サイズ:** `sm` = h-8/px-3/text-xs、`md` = h-10/px-5/text-sm、`lg` = h-12/px-7/text-sm

**バリアント外観:**

- `primary`: `--acc` で塗り、文字は `--acc-on`。ホバーで不透明度 90%
- `outline`: `--field` の枠線のみ。ホバーで背景 `--panel`
- `ghost`: 背景も枠も持たない。ホバーで文字色を `--ink` へ

**共通:** `rounded-sm`（角丸 2px）、`font-bold`、`focus-visible:ring-2 ring-acc`、`disabled:opacity-50`

`primary` は地の色で塗られるためフォーカスリングが同化する。`ring-offset-2 ring-offset-paper` で地との間に隙間を挟む。拡大（`hover:scale`）は使わない。

#### Input

| Props | 型 | 説明 |
|-------|-----|------|
| `label` | `string?` | ラベルテキスト (required 時にアクセント色のアスタリスク表示) |
| `error` | `string?` | エラーメッセージ (`--warn`、エラー時は枠線も `--warn`) |
| `hint` | `string?` | ヒントテキスト (エラー非表示時のみ表示) |

**スタイル:** `bg-panel`, `rounded-sm`, `px-3 py-2.5`, `text-sm`

枠線に `--rule`（装飾罫線）ではなく **`--field` を使う**。WCAG 1.4.11 は操作できる部品の境界に 3:1 を要求しており、装飾用の細い罫線ではこれを満たせない（`docs/04` §5.2）。

#### TextArea

Input と同等のインターフェース。追加で `min-h-[120px]`, `resize-y` を適用。

#### Badge

| Props | 型 | デフォルト | 説明 |
|-------|-----|----------|------|
| `variant` | `'accent' \| 'outline'` | `'accent'` | 外観バリアント |

**現在の用途は「現在」のような状態表示に限られる。** 旧デザインでは技術スタックの羅列にも使っていたが、分類集約（issue #137）とチップ表示へ置き換えたため。

`<div>` ではなく **`<span>`**。見出しやタイトルの行内に置くため、ブロック要素だと文章の途中に挟めない。

**共通:** `rounded-sm`、等幅 10px、`tracking-widest`

#### ThemeToggle

配色テーマを切り替える。props は持たない。

**トグル 1 個ではなくボタン 2 個**。選択中かどうかの表示は JS ではなく CSS が決める。理由は §5.5 を参照。

| 要素 | アクセシビリティ |
|------|----------------|
| 外枠 | `role="group"` / `aria-label="配色テーマ"` |
| ライトボタン | `aria-label="ライトテーマに切り替える"` |
| ダークボタン | `aria-label="ダークテーマに切り替える"` |
| 記号 (○ / ●) | `aria-hidden="true"`（読み上げを汚さない） |

### 6.3 Molecules

#### CareerCard

| Props | 型 | 説明 |
|-------|-----|------|
| `title` | `string` | プロジェクトタイトル |
| `period` | `string` | 期間テキスト (フォーマット済み) |
| `teamSize` | `string` | チーム規模 |
| `description` | `string` | 説明 |
| `techStack` | `string[]` | 技術スタック（分類ごとにまとめてチップ表示） |
| `phases` | `string[]` | 担当フェーズ（中黒区切りの 1 行） |
| `role` | `string` | 役割 |
| `isCurrent` | `boolean?` | 現在進行中フラグ（左罫の色と「現在」バッジを切り替える） |

**カード内セクション構成:**

1. タイトル（+ 進行中なら「現在」バッジ）
2. 期間・チーム規模（等幅 1 行）
3. 説明文
4. 技術スタック（分類ごとのチップ。中身のある分類のみ）
5. 担当フェーズ（中黒区切り。空なら見出しごと描画しない）
6. 役割

ルート要素は `<div>` ではなく **`<article>`**。経歴 1 件は独立して意味を持つ内容のため。

#### SocialLinks

| Props | 型 | 説明 |
|-------|-----|------|
| `links` | `SNSItem[]` | SNSリンクデータ配列 |
| `className` | `string?` | 追加クラス |

**アイコン画像ではなく `sns_name` のテキストチップで表示する。** `sns_img` が指す GCS 上の SVG は白一色（`github_original_white.svg` 等）で、紙のような明るい地の上では見えなくなる。データは変更しない方針（issue #135）のため、明るい地でも読める表現へ置き換えた。CSS フィルタで反転させる手もあるが、将来データ側が色付きアイコンに差し替わると破綻する。

その結果 **`sns_img` は画面から参照されなくなる**（`career_title_data` / `contact_data` と同じ状態）。

表示は `sns_name` をそのまま使う。データ上は小文字（`github` / `zenn`）だが、等幅で組むと表記として成立するため大文字化などの加工はしない。`size` prop は廃止した。

### 6.4 Organisms

#### Header

ナビゲーション + モバイルメニューの複合コンポーネント (詳細は 3.1 節参照)。

#### ContactForm

フォーム入力 + バリデーション + API送信 + 状態管理の複合コンポーネント (詳細は 3.6 節参照)。

---

## 7. ビジネスロジック

### 7.1 日付変換 (`toDateString`)

```text
入力: "YYYY年M月" または "YYYY年MM月"
正規表現: /(\d{4})年(\d{1,2})月/
出力: "YYYY/MM/01"
例: "2024年3月" -> "2024/03/01"
不正入力: Error("Invalid format: ...") をスロー
```

### 7.2 経歴期間フォーマット (`formatCareerPeriod`)

```text
入力: start = "YYYY年M月", end = "YYYY年M月" | "now"
処理:
  1. toDateString() で日付文字列に変換
  2. Date オブジェクトを生成 (end="now" の場合は new Date())
  3. 年月を抽出
出力:
  - end="now": "YYYY年M月 - 現在"
  - それ以外: "YYYY年M月 - YYYY年M月"
```

### 7.3 技術スタックの分類 (`groupTechStack`)

`src/lib/group-tech-stack.ts`（issue #137）。経歴 1 件の `career_skill_stack`（最大 30 件）を
9 区分へ束ねる。

```text
入力: string[]（GCS 由来のため型は保証されない）
処理:
  1. 文字列以外・空文字・空白のみを捨てる
  2. 前後の空白を落とす
  3. 大文字小文字を無視して重複を除く（先に現れた表記を残す）
  4. TECH_CATEGORY_BY_NAME で区分を引く。未登録は other（黙って捨てない）
出力: TechGroup[]（中身のある区分だけを TECH_CATEGORIES の定義順で返す）
```

| 区分 | ラベル |
|------|-------|
| `language` | 言語 |
| `framework` | フレームワーク |
| `platform` | OS・ミドルウェア |
| `testing` | テスト |
| `infrastructure` | 基盤・CI |
| `ai` | AI 活用 |
| `design` | 設計 |
| `collaboration` | 協働ツール |
| `other` | その他 |

> **並べ替えではなく分類にした理由**: 最新案件の 29 件のうち 10 件が協働ツールで、
> フラットに並べると読み手が信号（言語・フレームワーク・テスト）とノイズを
> 自力で分離するほかなかった。件数を減らさずに読める形にするのが目的（issue #135）。

### 7.4 経歴サマリの集計 (`summarizeCareers`)

`src/lib/career-summary.ts`（issue #138）。Hero の実績バンドに出す 3 つの数値を作る。

```text
入力: CareerData[]
出力:
  - projectCount:   件数（そのまま）
  - technologyCount: 全案件の技術をユニーク化した件数（大小文字・前後空白を無視）
  - startYear:      career_start から取れる最も古い年。1 件も取れなければ null
不正な career_start: その 1 件を開始年の算出から外すだけで、例外は投げない
```

> `toDateString` が不正入力で例外を投げるのに対し、こちらは**投げない**。
> 表記ゆれ 1 件でページ全体が error.tsx に落ちるのは割に合わないため。

### 7.5 フォームバリデーション

**クライアントサイド (Zod + React Hook Form):**

- `zodResolver(ContactFormSchema)` による送信時バリデーション
- `useForm` は `mode` 未指定のため、デフォルトの `onSubmit` モードで動作
- 初回送信時に全フィールドバリデーション実行。初回送信後はフィールド変更時に再検証（React Hook Form のデフォルト挙動）
- `handleSubmit` 内で Zod スキーマによる検証が通った場合のみ送信処理を実行

**サーバーサイド (API Route):**

- 必須フィールドチェック
- メールアドレス正規表現チェック
- メッセージ長上限チェック (5000文字 -- クライアントの2000文字より緩い)

### 7.6 データ取得戦略

```text
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
  |     link_title, about_name, career_name, contact_name
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
