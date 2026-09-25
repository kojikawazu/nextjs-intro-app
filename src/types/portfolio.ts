/**
 * アプリケーション全体の表示データを統合するルート型。
 *
 * GCS に格納される JSON ファイルの構造とフィールド名が 1 対 1 で対応する。
 * そのためスネークケースのフィールド名は外部データ構造に固定されており、
 * 命名を変えて自己説明的にすることができない。各フィールドの意味は
 * `docs/05-data-specification.md` §2 を出典とする。
 */
export interface PortfolioData {
    /** ナビゲーションバーの表示データ */
    navbar_data: NavbarData;
    /** ヒーローセクションの表示データ */
    hero_data: HeroData;
    /** 自己紹介セクションの表示データ */
    about_data: AboutData;
    /** 経歴セクションのカラムタイトルデータ。現在の UI では未参照（`CareerTitleData` 参照） */
    career_title_data: CareerTitleData;
    /** 経歴一覧データ */
    career_data: CareerData[];
    /** AI 活用セクションの表示データ */
    ai_usage_data: AiUsageData;
    /** 個人開発セクションの表示データ */
    product_data: ProductData;
    /** 執筆記事セクションの表示データ */
    article_data: ArticleData;
    /** お問い合わせセクションの表示データ。現在の UI では未参照（`ContactData` 参照） */
    contact_data: ContactData;
    /** フッターの表示データ */
    footer_data: FooterData;
}

/** ナビゲーションバーに表示するロゴと各セクションへのリンク名。 */
export interface NavbarData {
    /** サイトのロゴ / タイトルテキスト */
    link_title: string;
    /** About セクションのナビリンク表示名 */
    about_name: string;
    /** Career セクションのナビリンク表示名 */
    career_name: string;
    /** AI 活用セクションのナビリンク表示名 */
    ai_usage_name: string;
    /** 個人開発セクションのナビリンク表示名 */
    product_name: string;
    /** 執筆記事セクションのナビリンク表示名 */
    article_name: string;
    /** Contact セクションのナビリンク表示名 */
    contact_name: string;
}

/** ヒーローセクションの表示データ。 */
export interface HeroData {
    /** ヒーロー背景画像の URL */
    hero_img_url: string;
}

/** 自己紹介セクションの表示データ。 */
export interface AboutData {
    /** 表示名 / 氏名 */
    about_name: string;
    /** アイコン画像の URL */
    about_icon_url: string;
    /** プロフィール画像の URL */
    about_img_url: string;
    /** SNS リンク一覧 */
    sns_list: SNSItem[];
    /** 自己紹介文。段落ごとに 1 要素へ分割して保持する */
    about_contents: string[];
}

/** 自己紹介セクションに並べる SNS リンク 1 件分のデータ。 */
export interface SNSItem {
    /** SNS サービス名（例: `GitHub`） */
    sns_name: string;
    /** SNS プロフィールページの URL */
    sns_url: string;
    /** SNS アイコン画像の URL */
    sns_img: string;
}

/**
 * 経歴カードに表示する各項目のラベル（列タイトル）。
 *
 * **現在の UI では未使用。** GCS の JSON と `PortfolioData` には含まれるが、
 * `CareerCard.tsx` はラベルを「技術スタック」「担当フェーズ」等のハードコード文字列で
 * 描画しており、この型の値を参照していない。将来ラベルをデータ駆動へ切り替える際に使う。
 * 詳細は `docs/05-data-specification.md` §2.6。
 */
export interface CareerTitleData {
    /** 期間の列タイトル */
    career_title_period: string;
    /** 人数の列タイトル */
    career_title_member: string;
    /** 内容の列タイトル */
    career_title_contents: string;
    /** 技術スタックの列タイトル */
    career_title_stack: string;
    /** フェーズの列タイトル */
    career_title_phase: string;
    /** 役割の列タイトル */
    career_title_role: string;
}

/** 経歴セクションに表示するプロジェクト 1 件分のデータ。 */
export interface CareerData {
    /** プロジェクト名 / 案件タイトル */
    career_title: string;
    /** 開始年月。`YYYY年MM月` 形式（`toDateString()` がこの形式を前提に解析する） */
    career_start: string;
    /** 終了年月。`YYYY年MM月` 形式、または在籍中を表す `"now"` */
    career_end: string;
    /** チーム人数（例: `5名`） */
    career_member: string;
    /** 業務内容の説明 */
    career_contents: string;
    /** 使用技術一覧 */
    career_skill_stack: string[];
    /** 担当フェーズ一覧（例: `設計` / `開発` / `テスト`） */
    career_skill_phase: string[];
    /** プロジェクトでの役割 */
    career_role: string;
}

/**
 * 個人開発セクションの表示データ。
 *
 * 掲載内容は GCS の JSON へ手書きする（issue #128、親 #125 の共通前提 1）。
 * GitHub API からのリポジトリ自動取得は行わない。**見せたいものだけを選び、説明文と
 * 見せ方を制御する**のが目的であり、リポジトリ一覧をそのまま出すのとは用途が違うため。
 */
export interface ProductData {
    /** セクションの見出し下に表示する説明文 */
    product_description: string;
    /** 掲載するプロダクトの一覧。表示順は配列順に従う */
    product_items: ProductItem[];
}

/**
 * 個人開発プロダクト 1 件分のデータ。
 *
 * フィールド名は既存の `CareerData` の語彙（`career_title` / `career_contents` /
 * `career_skill_stack`）へ揃えている。とくに**プロダクト名が `product_name` でないのは、
 * `NavbarData.product_name`（ナビの表示名）と衝突するため**。`NavbarData` 側は
 * `about_name` / `career_name` / `contact_name` という確立した規則を持つので、
 * 衝突はアイテム側の改名で解消している（issue #128）。
 *
 * **スクリーンショットの URL は持たない。** `next.config.js` が `images: { unoptimized: true }`
 * のため画像最適化が効かず原寸で配信される。`docs/04` の LCP 目標 2.5 秒に対し、
 * 掲載件数分の画像がページ転送量の大半を占めることになる。`product_site_url` から
 * 実物を見に行けるため情報は途切れない。
 */
export interface ProductItem {
    /** プロダクト名 */
    product_title: string;
    /** 概要説明 */
    product_contents: string;
    /** 公開中のサイト URL。未公開なら空文字（リンクを描画しない） */
    product_site_url: string;
    /** リポジトリ URL。非公開なら空文字（リンクを描画しない） */
    product_repo_url: string;
    /** 使用技術一覧。分類はせずそのままチップで並べる */
    product_skill_stack: string[];
}

/**
 * 執筆記事セクションの表示データ。
 *
 * 掲載内容は GCS の JSON へ手書きする（issue #127、親 #125 の共通前提 1）。
 * Zenn / Qiita の API からの自動取得は行わない。取得を足すと `repositories/` の新規実装・
 * キャッシュ・レート制限・障害時のフォールバックがすべて必要になる一方、掲載したいのは
 * **反響のあった数本だけ**であり、全件を機械的に並べる用途ではないため。
 *
 * **セクション名は `Blog` ではなく `Articles`。** 個人開発セクション（issue #128）に
 * 自作のブログ基盤「ブログWebアプリ」を掲載しており、`Blog` だと「作ったもの」と
 * 「書いた記事」が同じ語で並んでしまう。
 */
export interface ArticleData {
    /** セクションの見出し下に表示する説明文 */
    article_description: string;
    /** 掲載する記事の一覧。表示順は配列順に従う */
    article_items: ArticleItem[];
}

/**
 * 執筆記事 1 件分のデータ。
 *
 * フィールド名は `CareerData` / `ProductItem` の語彙（`*_title` / `*_contents`）へ揃えている。
 *
 * **いいね数やブックマーク数は持たない。** 掲載する記事を選ぶ基準としては使うが、
 * GCS の JSON は手書きのため、載せると実際の数字とずれ続ける。更新し続ける前提の値を
 * 手書きデータに置かない。
 */
export interface ArticleItem {
    /** 記事タイトル。リンクの可視テキストになる */
    article_title: string;
    /** 記事の URL。外部サイトのため別タブで開く */
    article_url: string;
    /** 掲載媒体（例: `Zenn`） */
    article_platform: string;
    /** 公開年月。`YYYY年M月` 形式（`CareerData` と同じ表記） */
    article_published_at: string;
    /** 記事の概要。1 行で収まる長さにする */
    article_contents: string;
}

/**
 * AI 活用セクションの表示データ。
 *
 * **ポートフォリオ側は概要と導線だけを持つ。** 詳細は別サイトの解説ページに置いており、
 * ここでは原則 1 文と方針の要約を並べ、`ai_usage_detail_url` から詳細へ送る（issue #129）。
 * 詳細を両方に書くと、2 サイトで更新のタイミングがずれて内容が食い違っていくため。
 *
 * **ツール一覧は持たない。** 起票時は `ai_tools` を案に含めていたが、解説ページ側に
 * ツール一覧が無く、ポートフォリオ側だけに足すと詳細に無い内容を新しく書くことになるため
 * 外した。閲覧者に伝えたいのは「どのツールか」より「どう使い、品質をどう担保しているか」である。
 */
export interface AiUsageData {
    /** セクションの見出し下に表示する説明文。AI 活用の原則を 1 文で書く */
    ai_usage_description: string;
    /** 方針の要約一覧。表示順は配列順に従う */
    ai_practices: AiPractice[];
    /** 詳細を載せた解説ページの URL。空文字ならリンクを描画しない */
    ai_usage_detail_url: string;
}

/**
 * AI 活用の方針 1 件分のデータ。
 *
 * フィールド名は `ProductItem` / `ArticleItem` と同じ `*_title` / `*_contents` の語彙に揃える。
 */
export interface AiPractice {
    /** 方針の見出し */
    ai_practice_title: string;
    /** 方針の要約。1 文で収まる長さにする */
    ai_practice_contents: string;
}

/**
 * お問い合わせセクションの表示データ。
 *
 * **現在の UI では未使用。** GCS の JSON と `PortfolioData` には含まれるが、
 * セクション見出しやボタン文言は `page.tsx` / `ContactForm.tsx` にハードコードされており、
 * この型の値を参照していない。詳細は `docs/05-data-specification.md` の ContactData の節。
 * （節番号ではなく名前で参照する。節の追加で番号がずれるたびに参照が壊れるため）
 */
export interface ContactData {
    /** セクションの表示名 */
    contact_name: string;
    /** 表示用メールアドレス */
    contact_email: string;
    /** セクションの説明テキスト */
    contact_contents: string;
    /** 送信ボタンの表示テキスト */
    contact_btn_name: string;
}

/** フッターの表示データ。 */
export interface FooterData {
    /** コピーライト表記 */
    copyright: string;
}

/**
 * お問い合わせフォームから送信される入力値。
 *
 * `PortfolioData`（GCS 由来の表示データ）には含まれず、フォーム入力から生成される。
 * 実行時の検証は `ContactFormSchema` が担う。
 */
export interface ContactFormData {
    /** 送信者の名前 */
    name: string;
    /** 送信者のメールアドレス */
    email: string;
    /** 問い合わせメッセージ本文 */
    message: string;
}

/**
 * お問い合わせフォームのバリデーションエラーメッセージ。
 *
 * 各フィールドはエラーがある場合のみ設定されるため、すべてオプショナル。
 */
export interface ContactFormErrors {
    /** 名前フィールドのエラーメッセージ */
    name?: string;
    /** メールアドレスフィールドのエラーメッセージ */
    email?: string;
    /** メッセージフィールドのエラーメッセージ */
    message?: string;
}
