import { getPortfolioDataServer } from '@/repositories/portfolio';
import { HomeClient } from './client';

/**
 * ルートセグメントのレンダリング方式。動的レンダリングを強制する。
 *
 * 本ページはリクエスト時に GCS からデータを取得するため、既定のビルド時プリレンダーでは
 * 2 つの問題が起きる。1 つはビルド環境に GCP 認証が要求されること（Dockerfile の
 * `RUN pnpm run build` は認証情報を持たないためビルドが失敗する）。もう 1 つは
 * ポートフォリオの内容がビルド時点で凍結され、GCS 上の JSON を更新しても
 * 再デプロイまで反映されなくなること。
 *
 * エッジ / CDN 側のキャッシュは `api/portfolio` と同様に `Cache-Control` で行う方針だが、
 * ページ本体には現時点でキャッシュヘッダを付けていない。
 */
export const dynamic = 'force-dynamic';

/**
 * ポートフォリオのトップページ（Server Component）。
 *
 * データ取得をサーバー側で完結させ、描画は `client.tsx` の `HomeClient` に委譲する。
 * これにより初期 HTML に全セクションの本文が含まれる。以前はページ全体が
 * Client Component で `useEffect` から `/api/portfolio` を fetch していたため、
 * 初期 HTML にはローディングスピナーしか出力されていなかった
 * （JS を実行しない SNS のクローラからは本文が一切見えない状態だった）。
 *
 * 取得に失敗した場合は例外がそのまま伝播し、`error.tsx` のエラーバウンダリが描画される。
 * ここで握りつぶすと「本文が無いのに 200 が返る」状態になり、検索エンジンに
 * 空ページとしてインデックスされうるため、あえて捕捉しない。
 */
export default async function HomePage() {
    const portfolioData = await getPortfolioDataServer();

    return <HomeClient portfolioData={portfolioData} />;
}
