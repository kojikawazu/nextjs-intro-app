import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import './globals.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <body className="antialiased">{children}</body>
        </html>
    );
}
