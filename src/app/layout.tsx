import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { THEME_COOKIE_NAME } from '@/constants/theme';
import { parseTheme } from '@/lib/theme';
import { getSiteUrl } from '@/lib/site-url';
import './globals.css';

/**
 * サイト全体に適用するメタデータ（Next.js Metadata API の予約エクスポート）。
 *
 * 基準オリジンは `getSiteUrl()` 由来で、`SITE_URL` 未設定時は本番の正規オリジンになる。
 * canonical を apex に固定しているのは、apex と `www` の双方を Cloud Run にマッピングしており
 * リダイレクトを挟まず同一内容を 2 つの URL で配信しているため。構成は
 * `docs/09-architecture-specification.md` §7.4 を参照。
 */
export const metadata: Metadata = {
    // canonical / OGP を相対パスで書くための基準オリジン。
    // 未設定だと Next.js が localhost にフォールバックし、本番の OGP が壊れる。
    metadataBase: getSiteUrl(),
    title: 'TechProfile Pro - フリーランスエンジニア',
    description: 'フリーランスエンジニアのポートフォリオサイト',
    keywords: [
        'フリーランスエンジニア',
        'フリーランスエンジニア',
        'Java',
        'TypeScript',
        'Next.js',
        'バックエンド開発',
        'システム開発',
    ],
    authors: [{ name: 'フリーランスエンジニア' }],
    creator: 'フリーランスエンジニア',
    // apex と www の双方を Cloud Run にマッピングしており同一内容が 2 URL で配信されるため、
    // 正規 URL を明示して検索評価の分散を防ぐ。
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        locale: 'ja_JP',
        // metadataBase を基準に絶対 URL へ解決される。ドメイン文字列を複数箇所に散らさないため相対で書く。
        url: '/',
        title: 'TechProfile Pro - フリーランスエンジニア',
        description: 'フリーランスエンジニアのポートフォリオサイト',
        siteName: 'TechProfile Pro',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TechProfile Pro - フリーランスエンジニア',
        description: 'フリーランスエンジニアのポートフォリオサイト',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

/**
 * 全ページ共通のルートレイアウト。
 *
 * `<html lang="ja">` を宣言して検索エンジンの言語判定とスクリーンリーダーの
 * 読み上げ言語選択を正しくする。
 *
 * 配色テーマを Cookie から読み、`<html>` の `data-theme` として**初期 HTML に載せる**。
 * クライアントで適用すると一度ライトで描画してからダークへ切り替わるちらつきが出るため、
 * サーバー側で解決する。インラインスクリプトを使わないので、nonce + `strict-dynamic` の
 * CSP とも衝突しない（詳細は `docs/09-architecture-specification.md` §6.7）。
 *
 * **`<html>` に載せる必要がある。** ラッパー要素に載せると、`<body>` の背景・
 * スクロールバー・入力部品の配色（`color-scheme`）がテーマに追従せず、
 * OS がダークで利用者がライトを選んだ場合などにオーバースクロール部分だけ色が食い違う。
 *
 * その代償として、レイアウトを共有する 404 ページ（`_not-found`）も動的レンダリングになる。
 * 404 に CSP が付かないこと自体は変わらない（middleware のマッチャは `/` のみ）。
 *
 * @param props - Next.js が渡すレイアウトの props
 * @param props.children - 配下のページ
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const theme = parseTheme(cookieStore.get(THEME_COOKIE_NAME)?.value);

    return (
        <html lang="ja" data-theme={theme ?? undefined}>
            <head>
                {/* 本文の書体を待たせないよう、フォント配信元への接続を先に開く。 */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="antialiased">{children}</body>
        </html>
    );
}
