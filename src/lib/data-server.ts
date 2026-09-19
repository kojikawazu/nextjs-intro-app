import { PortfolioData } from '@/types/portfolio';
import { getPortfolioDataFromGCS } from './gcs';

/**
 * 開発時のローカルフォールバック用データ。`sample.json` が無ければ `null` のままになる。
 *
 * ESM の `import` は静的で条件分岐できず、`sample.json` は `.gitignore` 済みで本番イメージに
 * 存在しないため、ここだけ `require` を使って「読めなければ握りつぶす」形にしている。
 */
let portfolioData: PortfolioData | null = null;
if (process.env.NODE_ENV === 'development') {
    try {
        portfolioData = require('../../sample.json');
    } catch (error) {
        console.warn('sample.json not found, will use GCS only');
    }
}

/**
 * ポートフォリオデータをサーバー側で解決する。
 *
 * 解決順は次のとおり。開発時に GCS 認証なしでも画面を確認できるようにするための分岐で、
 * 本番（`NODE_ENV=production`）では常に GCS のみを参照する。
 *
 * 1. 開発時かつ `FORCE_GCS` 未設定かつ `sample.json` が読めていれば、ローカルデータを返す
 * 2. それ以外は GCS から取得する
 * 3. GCS 取得に失敗した場合、開発時かつ `sample.json` があればローカルデータへ退避する
 *
 * @returns ポートフォリオ表示データ
 * @throws GCS からの取得に失敗し、ローカルフォールバックも利用できない場合（本番は常にこの経路）
 */
export async function getPortfolioDataServer(): Promise<PortfolioData> {
    // In development, use local sample.json if available
    if (process.env.NODE_ENV === 'development' && !process.env.FORCE_GCS && portfolioData) {
        return portfolioData;
    }

    try {
        const gcsData = await getPortfolioDataFromGCS();
        return gcsData;
    } catch (error) {
        if (process.env.NODE_ENV === 'development' && portfolioData) {
            console.warn('Failed to fetch from GCS, falling back to local data:', error);
            return portfolioData;
        }
        throw error;
    }
}
