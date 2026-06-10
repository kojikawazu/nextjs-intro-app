# 05. データ仕様書

## 目次

- [1. 概要](#1-概要)
- [2. データモデル定義](#2-データモデル定義)
    - [2.1 PortfolioData（ルートデータモデル）](#21-portfoliodataルートデータモデル)
    - [2.2 NavbarData（ナビゲーションデータ）](#22-navbardataナビゲーションデータ)
    - [2.3 HeroData（ヒーローデータ）](#23-herodataヒーローデータ)
    - [2.4 AboutData（自己紹介データ）](#24-aboutdata自己紹介データ)
    - [2.5 SNSItem（SNSリンクデータ）](#25-snsitemsnsリンクデータ)
    - [2.6 CareerTitleData（経歴テーブルタイトルデータ）](#26-careertitledata経歴テーブルタイトルデータ)
    - [2.7 CareerData（経歴データ）](#27-careerdata経歴データ)
    - [2.8 SkillsData（スキルセクションデータ）](#28-skillsdataスキルセクションデータ)
    - [2.9 SkillCard（スキルカードデータ）](#29-skillcardスキルカードデータ)
    - [2.10 ContactData（お問い合わせセクションデータ）](#210-contactdataお問い合わせセクションデータ)
    - [2.11 FooterData（フッターデータ）](#211-footerdataフッターデータ)
    - [2.12 ContactFormData（問い合わせフォームデータ）](#212-contactformdata問い合わせフォームデータ)
    - [2.13 ContactFormErrors（フォームバリデーションエラー）](#213-contactformerrorsフォームバリデーションエラー)
- [3. データソースとストレージ](#3-データソースとストレージ)
    - [3.1 Google Cloud Storage（GCS）](#31-google-cloud-storagegcs)
        - [接続設定](#接続設定)
        - [認証方式](#認証方式)
    - [3.2 ローカル開発用データ](#32-ローカル開発用データ)
        - [ローカルデータの使用条件](#ローカルデータの使用条件)
- [4. データフロー](#4-データフロー)
    - [4.1 ポートフォリオデータフロー](#41-ポートフォリオデータフロー)
        - [詳細フロー](#詳細フロー)
    - [4.2 お問い合わせフォームデータフロー](#42-お問い合わせフォームデータフロー)
    - [4.3 開発環境 vs 本番環境データ戦略](#43-開発環境-vs-本番環境データ戦略)
- [5. データ形式仕様](#5-データ形式仕様)
    - [5.1 日付形式](#51-日付形式)
        - [日付変換ロジック](#日付変換ロジック)
        - [表示形式](#表示形式)
    - [5.2 URL 形式](#52-url-形式)
    - [5.3 テキスト形式](#53-テキスト形式)
    - [5.4 メール送信日時形式](#54-メール送信日時形式)
- [6. スキル表示仕様](#6-スキル表示仕様)
- [7. 環境変数一覧](#7-環境変数一覧)

---

## 1. 概要

本ドキュメントは、TechProfile Pro ポートフォリオアプリケーションで使用するデータモデル、データソース、データフロー、およびデータ形式について定義する。

## 2. データモデル定義

すべてのデータ型は `src/types/portfolio.ts` に TypeScript インターフェースとして定義されている。

### 2.1 PortfolioData（ルートデータモデル）

アプリケーション全体のデータを統合するルートインターフェース。GCS に格納される JSON ファイルの構造と一致する。

| フィールド名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `navbar_data` | `NavbarData` | Yes | ナビゲーションバーの表示データ |
| `hero_data` | `HeroData` | Yes | ヒーローセクションの表示データ |
| `about_data` | `AboutData` | Yes | 自己紹介セクションの表示データ |
| `career_title_data` | `CareerTitleData` | Yes | 経歴セクションのカラムタイトルデータ。**注意**: 型定義およびJSON構造には含まれるが、現在のUI（`CareerCard.tsx`）ではラベルがハードコードされており、このデータは画面に反映されていない |
| `career_data` | `CareerData[]` | Yes | 経歴一覧データ（配列） |
| `skills_data` | `SkillsData` | Yes | スキルセクションの表示データ |
| `contact_data` | `ContactData` | Yes | お問い合わせセクションの表示データ。**注意**: 型定義およびJSON構造には含まれるが、現在のUI（`page.tsx`, `ContactForm.tsx`）ではセクション見出し・ボタン文言がハードコードされており、このデータは画面に反映されていない |
| `footer_data` | `FooterData` | Yes | フッターの表示データ |

### 2.2 NavbarData（ナビゲーションデータ）

| フィールド名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `link_title` | `string` | Yes | サイトのロゴ / タイトルテキスト | `"TechProfile"` |
| `about_name` | `string` | Yes | Aboutセクションのナビリンク表示名 | `"About"` |
| `career_name` | `string` | Yes | Careerセクションのナビリンク表示名 | `"Career"` |
| `skills_name` | `string` | Yes | Skillsセクションのナビリンク表示名 | `"Skills"` |
| `contact_name` | `string` | Yes | Contactセクションのナビリンク表示名 | `"Contact"` |

### 2.3 HeroData（ヒーローデータ）

| フィールド名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `hero_img_url` | `string` | Yes | ヒーロー背景画像のURL | `"https://storage.googleapis.com/.../hero.jpg"` |

### 2.4 AboutData（自己紹介データ）

| フィールド名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `about_name` | `string` | Yes | 表示名 / 氏名 | `"Koji Kawazu"` |
| `about_icon_url` | `string` | Yes | アイコン画像のURL | `"https://storage.googleapis.com/.../icon.png"` |
| `about_img_url` | `string` | Yes | プロフィール画像のURL | `"https://storage.googleapis.com/.../profile.jpg"` |
| `sns_list` | `SNSItem[]` | Yes | SNSリンク一覧（配列） | - |
| `about_contents` | `string[]` | Yes | 自己紹介文（段落ごとの配列） | `["段落1のテキスト", "段落2のテキスト"]` |

### 2.5 SNSItem（SNSリンクデータ）

| フィールド名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `sns_name` | `string` | Yes | SNSサービス名 | `"GitHub"` |
| `sns_url` | `string` | Yes | SNSプロフィールページのURL | `"https://github.com/kojikawazu"` |
| `sns_img` | `string` | Yes | SNSアイコン画像のURL | `"https://storage.googleapis.com/.../github.svg"` |

### 2.6 CareerTitleData（経歴テーブルタイトルデータ）

> **未使用**: この型はGCSのJSONデータに含まれ、`PortfolioData` の型定義にも存在するが、**現在のUI（`CareerCard.tsx`）ではラベルが「技術スタック」「担当フェーズ」「役割」等のハードコード文字列で表示されており、このデータは参照されていない**。将来的にデータ駆動のラベル表示に切り替える場合に使用可能。

経歴カードに表示する各項目のラベル（列タイトル）を定義する。

| フィールド名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `career_title_period` | `string` | Yes | 期間の列タイトル | `"期間"` |
| `career_title_member` | `string` | Yes | 人数の列タイトル | `"人数"` |
| `career_title_contents` | `string` | Yes | 内容の列タイトル | `"内容"` |
| `career_title_stack` | `string` | Yes | 技術スタックの列タイトル | `"技術スタック"` |
| `career_title_phase` | `string` | Yes | フェーズの列タイトル | `"フェーズ"` |
| `career_title_role` | `string` | Yes | 役割の列タイトル | `"役割"` |

### 2.7 CareerData（経歴データ）

| フィールド名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `career_title` | `string` | Yes | プロジェクト名 / 案件タイトル | `"ECサイト開発プロジェクト"` |
| `career_start` | `string` | Yes | 開始年月（`YYYY年MM月` 形式） | `"2023年04月"` |
| `career_end` | `string` | Yes | 終了年月（`YYYY年MM月` 形式）または `"now"` | `"2024年03月"` または `"now"` |
| `career_member` | `string` | Yes | チーム人数 | `"5名"` |
| `career_contents` | `string` | Yes | 業務内容の説明 | `"バックエンドAPI設計・開発を担当"` |
| `career_skill_stack` | `string[]` | Yes | 使用技術一覧（配列） | `["React", "TypeScript", "Node.js"]` |
| `career_skill_phase` | `string[]` | Yes | 担当フェーズ一覧（配列） | `["設計", "開発", "テスト"]` |
| `career_role` | `string` | Yes | プロジェクトでの役割 | `"バックエンドエンジニア"` |

### 2.8 SkillsData（スキルセクションデータ）

| フィールド名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `skills_cards` | `SkillCard[]` | Yes | スキルカード一覧（配列） | - |
| `skills_more` | `string` | Yes | 全スキル表示後のメッセージ | `"全てのスキルを表示しました"` |

### 2.9 SkillCard（スキルカードデータ）

| フィールド名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `skills_card_icon` | `string` | Yes | スキルアイコン画像のURL | `"https://storage.googleapis.com/.../react.svg"` |
| `skills_card_name` | `string` | Yes | スキル名 | `"React"` |
| `skills_card_contents` | `string` | Yes | スキルの説明 / 経験詳細 | `"3年以上の実務経験"` |

### 2.10 ContactData（お問い合わせセクションデータ）

> **未使用**: この型はGCSのJSONデータに含まれ、`PortfolioData` の型定義にも存在するが、**現在のUI（`page.tsx:274` のセクション見出し「Contact」、`ContactForm.tsx:127` のボタン文言「上記内容で送信する」等）ではハードコードされており、このデータは参照されていない**。将来的にデータ駆動の表示に切り替える場合に使用可能。

| フィールド名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `contact_name` | `string` | Yes | セクションの表示名 | `"Contact"` |
| `contact_email` | `string` | Yes | 表示用メールアドレス | `"example@email.com"` |
| `contact_contents` | `string` | Yes | セクションの説明テキスト | `"お気軽にお問い合わせください"` |
| `contact_btn_name` | `string` | Yes | 送信ボタンの表示テキスト | `"送信"` |

### 2.11 FooterData（フッターデータ）

| フィールド名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `copyright` | `string` | Yes | コピーライト表記 | `"(C) 2025 TechProfile Pro"` |

### 2.12 ContactFormData（問い合わせフォームデータ）

ユーザーが問い合わせフォームから送信するデータ。PortfolioData には含まれず、フォーム入力から生成される。

| フィールド名 | 型 | 必須 | 説明 | 例 |
|---|---|---|---|---|
| `name` | `string` | Yes | 送信者の名前 | `"山田太郎"` |
| `email` | `string` | Yes | 送信者のメールアドレス | `"taro@example.com"` |
| `message` | `string` | Yes | 問い合わせメッセージ本文 | `"サービスについて詳しく知りたいです"` |

### 2.13 ContactFormErrors（フォームバリデーションエラー）

クライアント側のバリデーション結果を保持する。各フィールドはオプショナルで、エラーがある場合のみ値が設定される。

| フィールド名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | `string` | No | 名前フィールドのエラーメッセージ |
| `email` | `string` | No | メールアドレスフィールドのエラーメッセージ |
| `message` | `string` | No | メッセージフィールドのエラーメッセージ |

## 3. データソースとストレージ

### 3.1 Google Cloud Storage（GCS）

本番環境のポートフォリオデータは、GCS のプライベートバケットに JSON ファイルとして格納される。

#### 接続設定

| 設定項目 | 環境変数 | デフォルト値 | 説明 |
|---|---|---|---|
| バケット名 | `GCS_PRIVATE_BUCKET_NAME` | `intro_k_pri_bucket` | JSON ファイルが格納されるバケット |
| ファイルパス | `GCS_JSON_PATH` | `json/navbar_intro.json` | バケット内の JSON ファイルパス |

#### 認証方式

環境に応じた認証方式が `src/lib/gcs.ts` に実装されている。ただし、分岐条件は `NODE_ENV` の値に基づくため、通常運用で有効なのは上位2つのみ。

| 環境 | 条件 | 認証方式 | 使用する環境変数 | 備考 |
|---|---|---|---|---|
| 本番環境 | `NODE_ENV === 'production'` | Application Default Credentials (ADC) | なし（自動） | Cloud Run 等の GCP 環境で有効 |
| 開発環境 | `NODE_ENV === 'development'` | サービスアカウントキーファイル | `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_CLOUD_PROJECT_ID` | ローカル開発用 |
| その他環境 | 上記いずれでもない場合 | サービスアカウント JSON キー | `GOOGLE_CLOUD_PRIVATE_KEY`, `GOOGLE_CLOUD_CLIENT_EMAIL` | **実質デッドコード**: `NODE_ENV` は通常 `production` または `development` のみ。`test` 等の値を設定した場合にのみ到達する |

### 3.2 ローカル開発用データ

`data-server.ts` には `sample.json`（プロジェクトルート直下）をフォールバックとして読み込むロジックが実装されている。ただし、**`sample.json` はリポジトリに含まれていない**（`.gitignore` 等による除外、またはそもそも未コミット）。そのため、fresh checkout の状態ではフォールバックは成立せず、GCS 接続が必須となる。

`data-server.ts:8-11` では `require('../../sample.json')` を `try/catch` で囲み、ファイルが存在しない場合は警告を出力して `null` のまま続行する。

#### ローカルデータの使用条件

以下の全てを満たす場合に限り、ローカルの `sample.json` が使用される。

1. `NODE_ENV` が `development` であること
2. プロジェクトルートに `sample.json` が存在し、`require()` での読み込みに成功すること
3. 環境変数 `FORCE_GCS` が設定されていないこと

> **現状**: リポジトリに `sample.json` が含まれていないため、開発環境でもデフォルトで GCS からデータを取得する。`FORCE_GCS` の有無に関わらず GCS 接続が必要。

GCS からの取得に失敗した場合、開発環境かつ `sample.json` が存在する場合のみフォールバックが機能する。

データ取得ロジックの実装は `src/lib/data-server.ts` にある。

## 4. データフロー

### 4.1 ポートフォリオデータフロー

```
[GCS プライベートバケット]
    |
    | (1) @google-cloud/storage SDK
    v
[gcs.ts: getPortfolioDataFromGCS()]
    |
    | (2) JSON パース・PortfolioData として返却
    v
[data-server.ts: getPortfolioDataServer()]
    |
    | (3) 環境に応じてGCS / ローカルを切り替え
    v
[API Route: GET /api/portfolio]
    |
    | (4) NextResponse.json() + キャッシュヘッダー付与
    v
[HTTP レスポンス (JSON)]
    |
    | (5) fetch('/api/portfolio') by useEffect
    v
[page.tsx: React State (portfolioData)]
    |
    | (6) 各セクションコンポーネントへ props として渡す
    v
[UI レンダリング]
```

#### 詳細フロー

1. **GCS データ取得** (`src/lib/gcs.ts`)
   - `Storage` クライアントを環境に応じた認証設定で初期化
   - バケット・ファイルの存在確認後、ファイルをダウンロード
   - ダウンロードしたバイナリコンテンツを `JSON.parse()` でパース

2. **サーバーサイドデータ取得** (`src/lib/data-server.ts`)
   - 開発環境かつ `FORCE_GCS` 未設定かつ `sample.json` が存在する場合、ローカルデータを返却
   - それ以外の場合、GCS からデータを取得
   - GCS 取得失敗時、開発環境ではローカルデータにフォールバック

3. **API レスポンス** (`src/app/api/portfolio/route.ts`)
   - `getPortfolioDataServer()` を呼び出してデータ取得
   - 成功時: `PortfolioData` を JSON として返却（キャッシュヘッダー付き）
   - 失敗時: エラーオブジェクトをステータス 500 で返却

4. **クライアントサイド取得** (`src/app/page.tsx`)
   - `useEffect` 内で `fetch('/api/portfolio')` を実行
   - 取得成功: `setPortfolioData(data)` で React State に設定
   - 取得中: ローディングスピナーを表示
   - 取得失敗: エラーメッセージとリロードボタンを表示

### 4.2 お問い合わせフォームデータフロー

```
[ユーザー入力 (ContactForm)]
    |
    | (1) Zod スキーマによるクライアント側バリデーション
    v
[ContactFormData: { name, email, message }]
    |
    | (2) POST /api/contact
    v
[API Route: POST /api/contact]
    |
    | (3) サーバー側バリデーション（必須チェック・形式・文字数）
    v
[resend.ts: sendContactEmail()]
    |
    | (4) Resend API を使用してメール送信
    v
[Resend API]
    |
    | (5) HTML + テキスト形式のメール配信
    v
[受信者メールボックス (MY_MAIL_ADDRESS)]
```

### 4.3 開発環境 vs 本番環境データ戦略

```
                    +-- [development] ---+
                    |                    |
                    |  FORCE_GCS=true?   |
                    |  Yes --> GCS       |
                    |  No  --> sample.json (存在する場合)
                    |          |
                    |          +-- 失敗時 --> GCS --> 失敗時 --> sample.json
                    |
[getPortfolioDataServer()]
                    |
                    +-- [production] ----+
                                         |
                                         +-- GCS (ADC認証)
                                              |
                                              +-- 失敗時 --> Error throw
```

## 5. データ形式仕様

### 5.1 日付形式

経歴データの開始日・終了日は以下の形式で記述する。

| 形式 | パターン | 説明 | 例 |
|---|---|---|---|
| 年月形式 | `YYYY年MM月` | 正規表現: `/(\d{4})年(\d{1,2})月/` | `"2023年04月"`, `"2024年1月"` |
| 現在 | `"now"` | 現在も継続中のプロジェクトを示す | `"now"` |

#### 日付変換ロジック

`src/lib/costom-date.ts` の `toDateString()` 関数で年月文字列を日付文字列に変換する。

- 入力: `"YYYY年MM月"` 形式の文字列
- 出力: `"YYYY/MM/01"` 形式の文字列（日は常に01）
- 月が1桁の場合、0埋めして2桁にする（例: `"2024年1月"` -> `"2024/01/01"`）
- 形式が不正な場合、`Error` をスローする

#### 表示形式

`page.tsx` の `formatCareerPeriod()` 関数で表示用にフォーマットする。

- 通常: `"2023年4月 - 2024年3月"`
- 現在進行中: `"2023年4月 - 現在"`

### 5.2 URL 形式

画像やリンクのURLは完全修飾URL（FQDN付き）で指定する。

| 用途 | 想定URL形式 |
|---|---|
| GCS 画像 | `https://storage.googleapis.com/{bucket}/{path}` |
| SNSリンク | `https://{domain}/{path}` |
| アイコン画像 | `https://storage.googleapis.com/{bucket}/{path}` |

### 5.3 テキスト形式

| フィールド | 形式 | 備考 |
|---|---|---|
| `about_contents` | プレーンテキスト配列 | 各要素が1段落として表示される |
| `career_contents` | プレーンテキスト | 改行なしの単一文字列 |
| `copyright` | プレーンテキスト | HTMLエンティティは使用しない |

### 5.4 メール送信日時形式

Resend API 経由で送信されるメールに含まれる日時は、JSTタイムゾーンで以下の形式で表示される。

```
toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
```

HTMLメール内の日時表示は年月日時分までフォーマットする。

```
toLocaleString('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})
```

## 6. スキル表示仕様

スキルカードは段階的に表示される。

| パラメータ | 値 | 説明 |
|---|---|---|
| `INITIAL_SKILLS_COUNT` | 9 | 初回表示時のスキル数 |
| `SKILLS_INCREMENT` | 6 | 「and more...」ボタン押下時の追加表示数 |

- 初回: 最初の9件を表示
- ボタン押下ごとに6件ずつ追加表示
- 全件表示後は `skills_more` のメッセージを表示
- 新しく追加されたカードには `animate-fade-in-up` アニメーションと段階的遅延が適用される

## 7. 環境変数一覧

| 環境変数 | 必須 | 説明 | 使用箇所 |
|---|---|---|---|
| `NODE_ENV` | Yes | 実行環境 (`development` / `production`) | 全体 |
| `GCS_PRIVATE_BUCKET_NAME` | No | GCS バケット名 | `gcs.ts` |
| `GCS_JSON_PATH` | No | GCS 内の JSON ファイルパス | `gcs.ts` |
| `GOOGLE_APPLICATION_CREDENTIALS` | No | GCS 認証キーファイルパス（開発用） | `gcs.ts` |
| `GOOGLE_CLOUD_PROJECT_ID` | No | GCP プロジェクトID（開発用） | `gcs.ts` |
| `GOOGLE_CLOUD_PRIVATE_KEY` | No | GCS サービスアカウント秘密鍵（その他環境用） | `gcs.ts` |
| `GOOGLE_CLOUD_CLIENT_EMAIL` | No | GCS サービスアカウントメール（その他環境用） | `gcs.ts` |
| `FORCE_GCS` | No | 開発環境で GCS を強制使用するフラグ | `data-server.ts` |
| `RESEND_API_KEY` | Yes* | Resend API キー（`re_` プレフィックス） | `resend.ts` |
| `RESEND_FROM_EMAIL` | Yes* | メール送信元アドレス | `resend.ts` |
| `MY_MAIL_ADDRESS` | Yes* | メール受信先アドレス | `resend.ts` |

*メール送信機能を使用する場合に必須
