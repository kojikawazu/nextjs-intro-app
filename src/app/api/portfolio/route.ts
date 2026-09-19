import { NextResponse } from 'next/server';
import { getPortfolioDataServer } from '@/lib/data-server';

/**
 * ルートセグメントのレンダリング方式。動的レンダリングを強制する。
 *
 * GCS 上の可変データをリクエスト時に取得するために必要。既定のビルド時プリレンダーだと
 * データがビルド時点で固定され、さらにビルド環境に GCS 認証が要求されてしまう。
 * エッジ / CDN 側のキャッシュは、代わりにレスポンスの `Cache-Control`（`s-maxage=300`）で行う。
 */
export const dynamic = 'force-dynamic';

/**
 * ポートフォリオ表示データを返す。
 *
 * 取得元の切り替え（GCS / 開発時の `sample.json`）は `getPortfolioDataServer()` が担う。
 * レスポンスには `s-maxage=300, stale-while-revalidate=86400` を付与し、
 * 動的レンダリングでありながら CDN 層で 5 分間キャッシュさせる。
 *
 * @returns 成功時は 200 でポートフォリオデータ、取得失敗時は 500 で `error` / `details` / `timestamp`
 */
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
