import { NextResponse } from 'next/server';
import { getPortfolioDataServer } from '@/lib/data-server';

// GCS 上の可変データをリクエスト時に取得する（ビルド時プリレンダーだと
// データがビルド時点で固定され、ビルドに GCS 認証も必要になるため）。
// エッジ/CDN 側のキャッシュはレスポンスの Cache-Control(s-maxage=300) で行う。
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('API: Starting portfolio data fetch...');
        const portfolioData = await getPortfolioDataServer();
        console.log('API: Successfully fetched portfolio data');

        return NextResponse.json(portfolioData, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('API Error fetching portfolio data:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        return NextResponse.json(
            {
                error: 'Failed to fetch portfolio data',
                details: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 500 },
        );
    }
}
