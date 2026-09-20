# 07. API仕様書

## 目次

- [1. 概要](#1-概要)
    - [1.1 ベースURL](#11-ベースurl)
    - [1.2 共通仕様](#12-共通仕様)
- [2. エンドポイント一覧](#2-エンドポイント一覧)
- [3. API 詳細仕様](#3-api-詳細仕様)
    - [3.1 GET /api/portfolio](#31-get-apiportfolio)
        - [ソースファイル](#ソースファイル)
        - [リクエスト](#リクエスト)
        - [成功レスポンス（200 OK）](#成功レスポンス200-ok)
        - [エラーレスポンス（500 Internal Server Error）](#エラーレスポンス500-internal-server-error)
        - [データ取得の内部処理フロー](#データ取得の内部処理フロー)
    - [3.2 POST /api/contact](#32-post-apicontact)
        - [ソースファイル](#ソースファイル-1)
        - [リクエスト](#リクエスト-1)
        - [成功レスポンス（200 OK）](#成功レスポンス200-ok-1)
        - [エラーレスポンス（400 Bad Request）](#エラーレスポンス400-bad-request)
        - [エラーレスポンス（500 Internal Server Error）](#エラーレスポンス500-internal-server-error-1)
        - [メール送信の内部処理フロー](#メール送信の内部処理フロー)
- [4. バリデーション仕様](#4-バリデーション仕様)
    - [4.1 クライアント側バリデーション（Zod スキーマ）](#41-クライアント側バリデーションzod-スキーマ)
        - [name（お名前）](#nameお名前)
        - [email（メールアドレス）](#emailメールアドレス)
        - [message（お問い合わせ内容）](#messageお問い合わせ内容)
    - [4.2 サーバー側バリデーション](#42-サーバー側バリデーション)
        - [name（お名前）](#nameお名前-1)
        - [email（メールアドレス）](#emailメールアドレス-1)
        - [message（お問い合わせ内容）](#messageお問い合わせ内容-1)
    - [4.3 クライアント側とサーバー側のバリデーション差異](#43-クライアント側とサーバー側のバリデーション差異)
- [5. キャッシュ戦略](#5-キャッシュ戦略)
    - [5.1 GET /api/portfolio のキャッシュ](#51-get-apiportfolio-のキャッシュ)
        - [キャッシュの動作](#キャッシュの動作)
    - [5.2 POST /api/contact のキャッシュ](#52-post-apicontact-のキャッシュ)
- [6. 外部サービス認証](#6-外部サービス認証)
    - [6.1 Google Cloud Storage (GCS)](#61-google-cloud-storage-gcs)
        - [認証設定の優先順位](#認証設定の優先順位)
        - [必要な GCS 権限](#必要な-gcs-権限)
        - [接続テスト](#接続テスト)
    - [6.2 Resend（メール送信サービス）](#62-resendメール送信サービス)
        - [認証](#認証)
        - [メール送信仕様](#メール送信仕様)
        - [メール本文の構成](#メール本文の構成)
        - [接続テスト](#接続テスト-1)
        - [ビルド時の挙動](#ビルド時の挙動)
- [7. エラーハンドリング](#7-エラーハンドリング)
    - [7.1 エラーレスポンス形式](#71-エラーレスポンス形式)
        - [GET /api/portfolio](#get-apiportfolio)
        - [POST /api/contact](#post-apicontact)
    - [7.2 サーバーサイドログ出力](#72-サーバーサイドログ出力)
    - [7.3 GCS エラーの詳細ログ](#73-gcs-エラーの詳細ログ)
- [8. クライアント側フェッチ仕様](#8-クライアント側フェッチ仕様)
    - [8.1 ポートフォリオデータの取得](#81-ポートフォリオデータの取得)
        - [UI 状態遷移](#ui-状態遷移)

---

## 1. 概要

本ドキュメントは、TechProfile Pro ポートフォリオアプリケーションが提供する REST API エンドポイントの仕様を定義する。

### 1.1 ベースURL

| 環境 | ベースURL |
|---|---|
| 開発環境 | `http://localhost:3000` |
| 本番環境 | デプロイ先ドメイン |

### 1.2 共通仕様

- **プロトコル**: HTTPS（本番環境）、HTTP（開発環境）
- **データ形式**: リクエスト・レスポンスともに JSON
- **Content-Type**: `application/json`
- **文字コード**: UTF-8
- **CORS**: ヘッダーを設定しない（同一オリジン専用。理由は docs/06 §6.3）
- **セキュリティヘッダー**: 全レスポンスへ付与（docs/06 §6.4 / §6.5）

## 2. エンドポイント一覧

| メソッド | パス | 説明 | 認証 | レートリミット |
|---|---|---|---|---|
| `GET` | `/api/portfolio` | ポートフォリオデータ取得 | 不要 | なし |
| `POST` | `/api/contact` | お問い合わせメール送信 | 不要 | 10分 / 5回（IP 単位） |

## 3. API 詳細仕様

---

### 3.1 GET /api/portfolio

ポートフォリオサイトの全表示データを取得する。

#### ソースファイル

`src/app/api/portfolio/route.ts`

#### リクエスト

| 項目 | 値 |
|---|---|
| メソッド | `GET` |
| パス | `/api/portfolio` |
| リクエストボディ | なし |
| クエリパラメータ | なし |
| 認証 | 不要 |

#### 成功レスポンス（200 OK）

**レスポンスヘッダー**

| ヘッダー | 値 | 説明 |
|---|---|---|
| `Content-Type` | `application/json` | レスポンス形式 |
| `Cache-Control` | `public, s-maxage=300, stale-while-revalidate=86400` | キャッシュ制御（後述） |

**レスポンスボディ**

`PortfolioData` 型の JSON オブジェクト。全フィールドの詳細は「05-data-specification.md」を参照。

```json
{
  "navbar_data": {
    "link_title": "TechProfile",
    "about_name": "About",
    "career_name": "Career",
    "skills_name": "Skills",
    "contact_name": "Contact"
  },
  "hero_data": {
    "hero_img_url": "https://storage.googleapis.com/.../hero.jpg"
  },
  "about_data": {
    "about_name": "名前",
    "about_icon_url": "https://storage.googleapis.com/.../icon.png",
    "about_img_url": "https://storage.googleapis.com/.../profile.jpg",
    "sns_list": [
      {
        "sns_name": "GitHub",
        "sns_url": "https://github.com/username",
        "sns_img": "https://storage.googleapis.com/.../github.svg"
      }
    ],
    "about_contents": [
      "自己紹介テキスト第1段落",
      "自己紹介テキスト第2段落"
    ]
  },
  "career_title_data": {
    "career_title_period": "期間",
    "career_title_member": "人数",
    "career_title_contents": "内容",
    "career_title_stack": "技術スタック",
    "career_title_phase": "フェーズ",
    "career_title_role": "役割"
  },
  "career_data": [
    {
      "career_title": "プロジェクト名",
      "career_start": "2023年04月",
      "career_end": "now",
      "career_member": "5名",
      "career_contents": "業務内容の説明",
      "career_skill_stack": ["React", "TypeScript"],
      "career_skill_phase": ["設計", "開発"],
      "career_role": "エンジニア"
    }
  ],
  "skills_data": {
    "skills_cards": [
      {
        "skills_card_icon": "https://storage.googleapis.com/.../react.svg",
        "skills_card_name": "React",
        "skills_card_contents": "スキルの説明"
      }
    ],
    "skills_more": "全てのスキルを表示しました"
  },
  "contact_data": {
    "contact_name": "Contact",
    "contact_email": "example@email.com",
    "contact_contents": "お気軽にお問い合わせください",
    "contact_btn_name": "送信"
  },
  "footer_data": {
    "copyright": "(C) 2025 TechProfile Pro"
  }
}
```

#### エラーレスポンス（500 Internal Server Error）

GCS からのデータ取得に失敗した場合に返却される。

```json
{
  "error": "ポートフォリオデータの取得に失敗しました"
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `error` | `string` | 固定のエラーメッセージ |

原因（例外の message・スタックトレース・バケット名・オブジェクトパス）はレスポンスに含めず、サーバーログにのみ残す（§7.2）。

#### データ取得の内部処理フロー

```
GET /api/portfolio
    |
    v
getPortfolioDataServer()
    |
    +-- [開発環境 & FORCE_GCS未設定 & sample.json存在]
    |       --> sample.json を返却
    |
    +-- [それ以外]
            --> getPortfolioDataFromGCS()
                    |
                    +-- ファイル存在確認
                    +-- ファイルダウンロード
                    +-- JSON パース
                    +-- 返却
                    |
                    +-- [失敗 & 開発環境 & sample.json存在]
                    |       --> sample.json にフォールバック
                    |
                    +-- [失敗 & 本番環境]
                            --> Error throw --> 500 レスポンス
```

---

### 3.2 POST /api/contact

お問い合わせフォームの内容をメールで送信する。

#### ソースファイル

`src/app/api/contact/route.ts`

#### リクエスト

| 項目 | 値 |
|---|---|
| メソッド | `POST` |
| パス | `/api/contact` |
| Content-Type | `application/json` |
| 認証 | 不要 |

**リクエストボディ**

```json
{
  "name": "山田太郎",
  "email": "taro@example.com",
  "message": "お問い合わせ内容をここに記述します。"
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | `string` | Yes | 送信者の名前 |
| `email` | `string` | Yes | 送信者のメールアドレス |
| `message` | `string` | Yes | お問い合わせメッセージ本文 |

#### 成功レスポンス（200 OK）

```json
{
  "success": true,
  "message": "お問い合わせありがとうございます。確認次第、ご連絡させていただきます。",
  "messageId": "abc123-def456-ghi789"
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `success` | `boolean` | 送信成功フラグ（常に `true`） |
| `message` | `string` | 成功メッセージ（日本語） |
| `messageId` | `string` | Resend API が返すメッセージID |

#### エラーレスポンス（400 Bad Request）

バリデーションエラー時に返却される。

```json
{
  "error": "エラーメッセージ"
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `error` | `string` | バリデーションエラーメッセージ（日本語） |

**バリデーションエラー一覧**

| 条件 | エラーメッセージ |
|---|---|
| いずれかのフィールドが空 | `"すべての項目を入力してください"` |
| メールアドレス形式不正 | `"有効なメールアドレスを入力してください"` |
| メッセージが5000文字超 | `"メッセージは5000文字以内で入力してください"` |

#### エラーレスポンス（500 Internal Server Error）

メール送信失敗またはサーバーエラー時に返却される。

```json
{
  "error": "エラーメッセージ"
}
```

| 条件 | エラーメッセージ |
|---|---|
| メール送信失敗（Resend API エラー） | `"メールの送信に失敗しました。しばらくしてからもう一度お試しください。"` |
| サーバー内部エラー（予期しない例外） | `"サーバーエラーが発生しました。しばらくしてからもう一度お試しください。"` |

#### メール送信の内部処理フロー

```
POST /api/contact
    |
    v
リクエストボディ JSON パース
    |
    v
サーバー側バリデーション
    |-- 必須チェック: name, email, message が全て非空
    |-- メール形式チェック: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    |-- 文字数チェック: message <= 5000文字
    |
    +-- [バリデーションエラー] --> 400 レスポンス
    |
    v
sendContactEmail({ name, email, message })
    |
    +-- 環境変数チェック (RESEND_API_KEY, MY_MAIL_ADDRESS, RESEND_FROM_EMAIL)
    |
    v
Resend API emails.send()
    |-- from: RESEND_FROM_EMAIL
    |-- to: MY_MAIL_ADDRESS
    |-- replyTo: <送信者のemail>
    |-- subject: "ポートフォリオサイトからのお問い合わせ - {name}様"
    |-- html: HTML形式メール本文
    |-- text: テキスト形式メール本文
    |
    +-- [成功] --> 200 レスポンス (success: true, messageId)
    +-- [失敗] --> 500 レスポンス
```

## 4. バリデーション仕様

### 4.1 クライアント側バリデーション（Zod スキーマ）

`src/schemas/contact.ts` に定義された `ContactFormSchema` によるバリデーション。フォーム送信前にクライアント側で実行され、**同じスキーマがサーバー側（§4.2）でも使われる**。

#### name（お名前）

| ルール | 値 | エラーメッセージ |
|---|---|---|
| 必須 | `min(1)` | `"お名前は必須です"` |
| 最小文字数 | `min(2)` | `"お名前は2文字以上で入力してください"` |
| 最大文字数 | `max(50)` | `"お名前は50文字以内で入力してください"` |

#### email（メールアドレス）

| ルール | 値 | エラーメッセージ |
|---|---|---|
| 必須 | `min(1)` | `"メールアドレスは必須です"` |
| メール形式 | `.email()` | `"正しいメールアドレスを入力してください"` |
| 最大文字数 | `max(255)` | `"メールアドレスは255文字以内で入力してください"` |

#### message（お問い合わせ内容）

| ルール | 値 | エラーメッセージ |
|---|---|---|
| 必須 | `min(1)` | `"お問い合わせ内容は必須です"` |
| 最小文字数 | `min(10)` | `"お問い合わせ内容は10文字以上で入力してください"` |
| 最大文字数 | `max(2000)` | `"お問い合わせ内容は2000文字以内で入力してください"` |

### 4.2 サーバー側バリデーション

`src/app/api/contact/route.ts` は **クライアントと同じ `ContactFormSchema`（`src/schemas/contact.ts`）** で検証する。
したがって §4.1 の表と完全に一致する。

```ts
const parsed = ContactFormSchema.safeParse(body);
if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
}
```

| フィールド | ルール |
|---|---|
| `name` | 必須 / 2〜50 文字 |
| `email` | 必須 / `z.string().email()` 形式 / 255 文字以内 |
| `message` | 必須 / 10〜2000 文字 |

リクエストボディが JSON として解析できない場合も 400（`リクエストの形式が不正です`）を返す。

### 4.3 クライアント側とサーバー側のバリデーション差異

**差異は無い。** 両者は同一の Zod スキーマを参照する。

`frontend.md` は「クライアント検証は UX のためのものでありセキュリティ担保ではない。Route Handler でも必ず検証する」「BFF と同じ入力ルールなら同じ Zod スキーマを `schemas/` から共有する」と定めており、本構成はこれに従う。**検証の実行は重複するが、ルールの定義は 1 箇所**という状態。

> **旧構成（〜2026-09-19）**: ハンドラが独自に必須チェック・メール形式の正規表現・`message` の 5000 文字上限を実装しており、スキーマを参照していなかった。結果として `name` の 2〜50 文字と `email` の 255 文字はサーバー側で未検証、`message` の上限も 2000 と 5000 で食い違っていた。フォームを経由しない直接リクエストではこれらの制約が一切効かなかった（issue #82 で解消）。

## 5. キャッシュ戦略

### 5.1 GET /api/portfolio のキャッシュ

> **注**: この Route Handler は `export const dynamic = 'force-dynamic'` によりリクエスト時に実行され、都度 GCS からデータを取得する（ビルド時プリレンダーではない）。オリジンでの再取得を抑えるキャッシュは、下記 `Cache-Control` により CDN / 共有キャッシュ側で行う。

```
Cache-Control: public, s-maxage=300, stale-while-revalidate=86400
```

| ディレクティブ | 値 | 説明 |
|---|---|---|
| `public` | - | CDN やプロキシサーバーによるキャッシュを許可 |
| `s-maxage` | `300`（5分） | 共有キャッシュ（CDN等）での最大キャッシュ時間 |
| `stale-while-revalidate` | `86400`（24時間） | 古いキャッシュを返しながらバックグラウンドで再検証する期間 |

#### キャッシュの動作

1. **0 ~ 5分**: キャッシュが新鮮（fresh）な状態。CDN はキャッシュからレスポンスを返す。
2. **5分 ~ 24時間**: キャッシュが古い（stale）状態。CDN は古いキャッシュを即座に返しつつ、バックグラウンドでオリジンサーバーにリクエストしてキャッシュを更新する。
3. **24時間以降**: キャッシュが完全に無効化。次のリクエストはオリジンサーバーに直接送信される。

### 5.2 POST /api/contact のキャッシュ

POST リクエストのため、キャッシュは適用されない。

## 6. 外部サービス認証

### 6.1 Google Cloud Storage (GCS)

ポートフォリオデータの取得に使用する。認証方式は環境ごとに異なる。

#### 認証設定の優先順位

```
(1) NODE_ENV === 'production'
    --> Application Default Credentials (ADC)
        Cloud Run のサービスアカウントが自動的に使用される

(2) NODE_ENV === 'development'
    --> GOOGLE_APPLICATION_CREDENTIALS 環境変数
        サービスアカウントキーファイルのパスを指定
    --> GOOGLE_CLOUD_PROJECT_ID（オプション）

(3) GOOGLE_CLOUD_PRIVATE_KEY が設定されている場合
    --> サービスアカウント JSON キーによる認証
    --> GOOGLE_CLOUD_CLIENT_EMAIL と組み合わせて使用
    --> 秘密鍵の改行文字 \\n は \n に変換される
```

#### 必要な GCS 権限

- `storage.objects.get` - ファイルの読み取り
- `storage.objects.list` - ファイル一覧の取得（存在確認用）

#### 接続テスト

`gcs.ts` の `testGCSConnection()` 関数でバケットへの接続確認が可能。開発環境でのみコンソールログを出力する。

### 6.2 Resend（メール送信サービス）

お問い合わせフォームからのメール送信に使用する。

#### 認証

| 設定項目 | 環境変数 | 説明 |
|---|---|---|
| API キー | `RESEND_API_KEY` | `re_` プレフィックスで始まるAPIキー |
| 送信元アドレス | `RESEND_FROM_EMAIL` | Resend で認証済みのドメインのメールアドレス |
| 受信先アドレス | `MY_MAIL_ADDRESS` | お問い合わせメールの宛先 |

#### メール送信仕様

| 項目 | 値 |
|---|---|
| From | `RESEND_FROM_EMAIL` の値 |
| To | `MY_MAIL_ADDRESS` の値 |
| Reply-To | 送信者が入力した `email` |
| Subject | `ポートフォリオサイトからのお問い合わせ - {name}様` |
| 形式 | HTML + プレーンテキスト（マルチパート） |
| タイムゾーン | `Asia/Tokyo`（JST） |

#### メール本文の構成

**HTML 形式**

```
+--------------------------------------------------+
|  新しいお問い合わせ                                 |
+--------------------------------------------------+
|  お客様情報                                        |
|  お名前: {name}                                    |
|  メールアドレス: {email}                            |
+--------------------------------------------------+
|  メッセージ内容                                     |
|  {message}                                         |
+--------------------------------------------------+
|  このメールはポートフォリオサイトの                   |
|  お問い合わせフォームから自動送信されました。          |
|  送信日時: YYYY/MM/DD HH:mm                        |
+--------------------------------------------------+
```

**プレーンテキスト形式**

```
新しいお問い合わせ

お客様情報:
お名前: {name}
メールアドレス: {email}

メッセージ内容:
{message}

送信日時: YYYY/MM/DD HH:mm:ss
```

#### 接続テスト

`resend.ts` の `testResendConnection()` 関数で API キーの形式チェックが可能。`re_` プレフィックスの有無を検証する。開発環境でのみコンソールログを出力する。

#### ビルド時の挙動

Resend クライアントの初期化時、`RESEND_API_KEY` が未設定の場合は `'dummy-key-for-build'` がフォールバック値として使用される。これはビルドプロセスでのエラーを防止するためのもので、実際のメール送信時には `RESEND_API_KEY` の存在チェックが行われる。

## 7. エラーハンドリング

### 7.1 エラーレスポンス形式

**全エンドポイントで `{ error: string }` に統一する。** 型は `src/types/api-error.ts` の `ApiErrorResponse` を単一の真実とし、各 Route Handler がこれを参照する（`error-handling.md`「統一エラーレスポンス」）。

| エンドポイント | ステータス | 説明 |
|---|---|---|
| `GET /api/portfolio` | 500 | GCS からのデータ取得失敗 |
| `POST /api/contact` | 400 | バリデーションエラー / リクエスト形式不正 |
| `POST /api/contact` | 429 | レートリミット超過。`Retry-After`（秒）を併せて返す（docs/06 §10） |
| `POST /api/contact` | 500 | メール送信失敗またはサーバーエラー |

**内部エラーメッセージ（`Error.message`）をレスポンスに載せない。** 従来 `GET /api/portfolio` のみ `details` と `timestamp` を併せて返していたが、取得元のバケット名・オブジェクトパスが外部へ漏れるため廃止した。

### 7.2 サーバーサイドログ出力

出力方針は `src/lib/logger.ts` に集約する。呼び出し側は「エラーか / 警告か / デバッグ情報か」だけを選ぶ。

| 関数 | 出力条件 | 用途 | 出力先 |
|---|---|---|---|
| `logError` | **常時**（本番含む） | 失敗の記録。スタックトレースを必ず残す | `console.error` |
| `logWarn` | 常時 | 処理は継続できるが注意が要る事象 | `console.warn` |
| `logDebug` | **開発環境のみ** | 進行状況の追跡 | `console.log` |

主な呼び出し箇所:

| 箇所 | 関数 | 内容 |
|---|---|---|
| `GET /api/portfolio` | `logDebug` | データ取得の開始・成功 |
| `GET /api/portfolio` | `logError` | 取得失敗（スタックトレース付き） |
| `POST /api/contact` | `logError` | メール送信失敗・想定外のエラー |
| `repositories/gcs.ts` | `logError` | GCS 取得失敗（バケット名・オブジェクトパス付き） |
| `repositories/resend.ts` | `logError` | Resend API エラー・送信失敗 |
| `repositories/portfolio.ts` | `logWarn` | `sample.json` 不在・ローカルデータへの退避 |

`meta` に何を渡すかは呼び出し側の責任であり、logger は自動マスキングを行わない。認証情報・個人情報・トークンを渡さないこと。問い合わせ内容（`name` / `email` / `message`）はログに出力しない。

### 7.3 GCS エラーのログ内容

GCS のデータ取得に失敗した場合、以下をサーバーログへ出力する。

```
[error] gcs: ポートフォリオ取得に失敗 { bucketName: "...", jsonPath: "...", stack: "..." }
```

| 項目 | 出力 | 理由 |
|---|---|---|
| `bucketName` / `jsonPath` | する | 「設定ミス」「権限不足」「ファイル欠落」の切り分けに必要。バケットへのアクセス自体は IAM が守るため、名前の露出は攻撃面にならない |
| `stack` | する | `error-handling.md`「エラー時はスタックトレースを含むログを出力する」 |
| `projectId` | **しない** | 環境変数の値をそのまま撒く必要がない。バケット名があれば切り分けは足りる |
| `hasCredentials`（認証情報の有無） | **しない** | 切り分け価値が低い一方、認証構成を推測する材料になる |

## 8. クライアント側フェッチ仕様

### 8.1 ポートフォリオデータの取得

> **注意（2026-09-19 更新）**: `src/app/page.tsx` は Server Component 化され、
> `repositories/portfolio.ts` からサーバー側で直接データを取得するようになった。
> **本エンドポイントはページから呼び出されていない。** BFF の公開 I/F および
> 統合テストの対象として維持している。以下は旧構成の記録である。

`src/app/page.tsx` にて、ページマウント時に `useEffect` 内で API を呼び出していた（旧構成）。

```
[コンポーネントマウント]
    |
    v
useEffect(() => fetchData(), [])
    |
    v
fetch('/api/portfolio')
    |
    +-- [response.ok === true]
    |       --> response.json() --> setPortfolioData(data)
    |
    +-- [response.ok === false]
    |       --> throw Error --> console.error
    |
    +-- [finally]
            --> setLoading(false)
```

#### UI 状態遷移

| 状態 | `loading` | `portfolioData` | 表示内容 |
|---|---|---|---|
| データ取得中 | `true` | `null` | ローディングスピナー |
| 取得成功 | `false` | `PortfolioData` | ポートフォリオ全体 |
| 取得失敗 | `false` | `null` | エラーメッセージ + リロードボタン |
