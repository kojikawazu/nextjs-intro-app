import { cookies } from 'next/headers';
import { getPortfolioDataServer } from '@/repositories/portfolio';
import { THEME_COOKIE_NAME } from '@/constants/theme';
import { parseTheme } from '@/lib/theme';
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
 *
 * 配色テーマを**ここで**読むのは、`layout.tsx` で `cookies()` を呼ぶと
 * レイアウトを共有する 404 ページ（`_not-found`）まで動的レンダリングになるため。
 * 404 が静的プリレンダーされることは `e2e/security.spec.ts` が検証している不変条件で、
 * nonce ベース CSP のマッチャを `/` に限定している理由でもある（`src/middleware.ts` 参照）。
 * 本ページは元から `force-dynamic` なので、ここで読む分には描画方式が変わらない。
 */
export default async function HomePage() {
    const portfolioData = await getPortfolioDataServer();
    const cookieStore = await cookies();
    const theme = parseTheme(cookieStore.get(THEME_COOKIE_NAME)?.value);

    return <HomeClient portfolioData={portfolioData} theme={theme} />;
}
