import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

/**
 * `sitemap.xml` を生成する。
 *
 * 本サイトは単一ページ構成で、各セクション（About / Career / Contact）は
 * アンカーリンクのため独立した URL を持たない。したがってエントリはトップページ 1 件のみとする。
 *
 * apex と www の双方が Cloud Run にマッピングされているが、sitemap には正規オリジン側だけを
 * 載せる（重複コンテンツの扱いは `layout.tsx` の canonical と合わせる）。
 *
 * @returns sitemap.xml に出力するエントリの一覧
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = getSiteUrl();

    return [
        {
            url: new URL('/', siteUrl).toString(),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
    ];
}
