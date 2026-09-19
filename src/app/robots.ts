import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

/**
 * `robots.txt` を生成する。
 *
 * 公開ポートフォリオのため全クローラに全ページを許可する。`host` を明示しているのは、
 * apex と www の双方が Cloud Run にマッピングされ同一内容を配信しているため、
 * どちらを正規として扱うかをクローラへ伝える必要があるという事情による。
 *
 * @returns robots.txt に出力するルール
 */
export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl();

    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        sitemap: new URL('/sitemap.xml', siteUrl).toString(),
        host: siteUrl.host,
    };
}
