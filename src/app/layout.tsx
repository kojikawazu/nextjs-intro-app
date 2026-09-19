import type { Metadata } from 'next';
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
 * 読み上げ言語選択を正しくする。データ取得や状態は持たず、Server Component のまま保つ。
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <body className="antialiased">{children}</body>
        </html>
    );
}
