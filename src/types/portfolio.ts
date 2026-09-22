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
    /** 個人開発セクションの表示データ */
    product_data: ProductData;
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
    /** 個人開発セクションのナビリンク表示名 */
    product_name: string;
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

/** 経歴タイムラインに表示するプロジェクト 1 件分のデータ。 */
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
 * お問い合わせセクションの表示データ。
 *
 * **現在の UI では未使用。** GCS の JSON と `PortfolioData` には含まれるが、
 * セクション見出しやボタン文言は `page.tsx` / `ContactForm.tsx` にハードコードされており、
 * この型の値を参照していない。詳細は `docs/05-data-specification.md` §2.10。
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
