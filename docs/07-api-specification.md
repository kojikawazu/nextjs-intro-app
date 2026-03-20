# 07. API仕様書

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

## 2. エンドポイント一覧

| メソッド | パス | 説明 | 認証 |
|---|---|---|---|
| `GET` | `/api/portfolio` | ポートフォリオデータ取得 | 不要 |
| `POST` | `/api/contact` | お問い合わせメール送信 | 不要 |

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
  "error": "Failed to fetch portfolio data",
  "details": "File json/navbar_intro.json not found in bucket intro_k_pri_bucket",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `error` | `string` | 固定のエラーメッセージ |
| `details` | `string` | 具体的なエラー原因（Error オブジェクトの message。不明な場合は `"Unknown error"`） |
| `timestamp` | `string` | エラー発生日時（ISO 8601 形式、UTC） |

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

`src/utils/validation.ts` に定義された `ContactFormSchema` によるバリデーション。フォーム送信前にクライアント側で実行される。

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

`src/app/api/contact/route.ts` のAPIルート内で実行されるバリデーション。

#### name（お名前）

| ルール | 条件 |
|---|---|
| 必須 | `!name` が truthy（空文字列・null・undefined を拒否） |

#### email（メールアドレス）

| ルール | 条件 |
|---|---|
| 必須 | `!email` が truthy |
| 形式チェック | 正規表現: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |

#### message（お問い合わせ内容）

| ルール | 条件 |
|---|---|
| 必須 | `!message` が truthy |
| 最大文字数 | `message.length > 5000` |

### 4.3 クライアント側とサーバー側のバリデーション差異

クライアント側（Zod）とサーバー側で異なるバリデーションルールが適用される。サーバー側はセキュリティ上の最終防衛ラインとして機能する。

| フィールド | ルール | クライアント側 | サーバー側 |
|---|---|---|---|
| `name` | 最小文字数 | 2文字以上 | 1文字以上（非空） |
| `name` | 最大文字数 | 50文字以内 | 制限なし |
| `email` | 形式チェック | Zod `.email()` | 正規表現 `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `email` | 最大文字数 | 255文字以内 | 制限なし |
| `message` | 最小文字数 | 10文字以上 | 1文字以上（非空） |
| `message` | 最大文字数 | 2000文字以内 | 5000文字以内 |

## 5. キャッシュ戦略

### 5.1 GET /api/portfolio のキャッシュ

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

#### GET /api/portfolio

| ステータス | 形式 | 説明 |
|---|---|---|
| 500 | `{ error: string, details: string, timestamp: string }` | GCS からのデータ取得失敗 |

#### POST /api/contact

| ステータス | 形式 | 説明 |
|---|---|---|
| 400 | `{ error: string }` | バリデーションエラー |
| 500 | `{ error: string }` | メール送信失敗またはサーバーエラー |

### 7.2 サーバーサイドログ出力

| API | ログ出力条件 | 内容 |
|---|---|---|
| `GET /api/portfolio` | 常時 | データ取得の開始・成功ログ |
| `GET /api/portfolio` | エラー時 | エラー詳細とスタックトレース |
| `POST /api/contact` | 開発環境のみ | メール送信失敗・サーバーエラーの詳細 |

### 7.3 GCS エラーの詳細ログ

GCS のデータ取得に失敗した場合、以下のデバッグ情報がサーバーログに出力される。

```
{
  bucketName: "バケット名",
  jsonPath: "ファイルパス",
  projectId: "プロジェクトID",
  hasCredentials: true/false
}
```

## 8. クライアント側フェッチ仕様

### 8.1 ポートフォリオデータの取得

`src/app/page.tsx` にて、ページマウント時に `useEffect` 内で API を呼び出す。

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
