import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'TechProfile Pro - koji kawazu',
    description: 'フリーランスエンジニア koji kawazu のポートフォリオサイト',
    keywords: [
        'koji kawazu',
        'フリーランスエンジニア',
        'Java',
        'TypeScript',
        'Next.js',
        'バックエンド開発',
        'システム開発',
    ],
    authors: [{ name: 'koji kawazu' }],
    creator: 'koji kawazu',
    openGraph: {
        type: 'website',
        locale: 'ja_JP',
        url: 'https://your-domain.com',
        title: 'TechProfile Pro - koji kawazu',
        description: 'フリーランスエンジニア koji kawazu のポートフォリオサイト',
        siteName: 'TechProfile Pro',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TechProfile Pro - koji kawazu',
        description: 'フリーランスエンジニア koji kawazu のポートフォリオサイト',
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
