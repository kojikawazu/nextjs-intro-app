import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
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
    openGraph: {
        type: 'website',
        locale: 'ja_JP',
        url: 'https://your-domain.com',
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
