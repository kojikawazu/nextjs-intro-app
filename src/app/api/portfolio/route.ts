import { NextResponse } from 'next/server';
import { getPortfolioDataServer } from '@/repositories/portfolio';
import { logDebug, logError } from '@/lib/logger';
import type { ApiErrorResponse } from '@/types/api-error';

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
 * @returns 成功時は 200 でポートフォリオデータ、取得失敗時は 500 で `ApiErrorResponse`
 */
export async function GET() {
    try {
        logDebug('portfolio: データ取得を開始');
        const portfolioData = await getPortfolioDataServer();
        logDebug('portfolio: データ取得に成功');

        return NextResponse.json(portfolioData, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        logError('portfolio: データ取得に失敗', error);

        // 原因（例外の message・スタック）はサーバーログにのみ残す。
        // レスポンスへ載せると取得元のバケット名やパスが外部へ漏れる。
        const body: ApiErrorResponse = { error: 'ポートフォリオデータの取得に失敗しました' };
        return NextResponse.json(body, { status: 500 });
    }
}
