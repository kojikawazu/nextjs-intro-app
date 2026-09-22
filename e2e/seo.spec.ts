import { test, expect } from '@playwright/test';

// webServer(env) で SITE_URL を固定しているため、期待値は本番の正規オリジンで確定する。
const CANONICAL_ORIGIN = 'https://introtechkkplus.com';

test.describe('SEO メタデータ（正常系）', () => {
    test('canonical と og:url が正規オリジンの絶対 URL を指す', async ({ page }) => {
        await page.goto('/');

        // Next.js は metadataBase に対して相対パス '/' を解決する際、ルートの末尾スラッシュを落とす。
        // sitemap 側（<loc>…/）とは表記が異なるが、ルート URL としては同一リソースを指す。
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            CANONICAL_ORIGIN,
        );
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
            'content',
            CANONICAL_ORIGIN,
        );
    });

    test('sitemap.xml がトップページ 1 件を返す', async ({ request }) => {
        const response = await request.get('/sitemap.xml');

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('xml');

        const body = await response.text();
        expect(body).toContain(`<loc>${CANONICAL_ORIGIN}/</loc>`);
        // セクションはアンカーのため URL は 1 本のみ。増えていたら仕様との齟齬。
        expect(body.match(/<loc>/g)).toHaveLength(1);
    });

    test('robots.txt が全許可と sitemap 参照を返す', async ({ request }) => {
        const response = await request.get('/robots.txt');

        expect(response.status()).toBe(200);

        const body = await response.text();
        expect(body).toContain('User-Agent: *');
        expect(body).toContain('Allow: /');
        expect(body).toContain(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`);
        expect(body).toContain(`Host: introtechkkplus.com`);
    });
});

test.describe('サーバーサイドレンダリング（正常系）', () => {
    test('初期 HTML に全セクションの本文が含まれる', async ({ request }) => {
        // request フィクスチャは JavaScript を実行しないため、ブラウザが JS を動かす前の
        // 生の HTML を検証できる。JS を実行しない SNS のクローラが見るものと同じ。
        const html = await (await request.get('/')).text();

        for (const keyword of [
            'Solving Problems with Technology',
            'About',
            'Career',
            'Product',
            'Articles',
            'Contact',
        ]) {
            expect(html).toContain(keyword);
        }
    });

    test('初期 HTML がローディング表示だけで終わっていない', async ({ request }) => {
        const html = await (await request.get('/')).text();

        // データ取得が useEffect に戻ると初期 HTML はスピナーだけになる。その退行をここで止める。
        expect(html).not.toContain('animate-spin');

        // タグを除いた本文が十分な分量あることを確認する。
        // 閾値は E2E のシードデータ基準（現状 973 文字）であり、本番データ量とは無関係。
        // useEffect 取得に戻ると 10 文字程度（"Loading..." のみ）まで落ちるため、
        // 桁で区別できる 300 を境界にしている（シード変更にも耐える余裕を持たせる）。
        const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '';
        const text = body
            .replace(/<script\b[\s\S]*?<\/script>/gi, '')
            .replace(/<style\b[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, '');

        expect(text.length).toBeGreaterThan(300);
    });
});

test.describe('SEO メタデータ（準正常系：設定漏れの回帰検出）', () => {
    test('メタデータにプレースホルダードメインや localhost が残っていない', async ({ page }) => {
        await page.goto('/');

        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');

        // metadataBase が外れると Next.js は localhost にフォールバックする。その退行をここで止める。
        for (const value of [canonical, ogUrl]) {
            expect(value).not.toContain('localhost');
            expect(value).not.toContain('your-domain.com');
            expect(value).not.toContain('introtechkk.com');
        }
    });

    test('robots.txt がサイト全体を Disallow していない', async ({ request }) => {
        const body = await (await request.get('/robots.txt')).text();

        // 公開ポートフォリオのため全面ブロックは事故。明示的に固定する。
        expect(body).not.toContain('Disallow: /');
    });
});

test.describe('SEO メタデータ（異常系）', () => {
    test('sitemap.xml が平文 HTTP の URL を含まない', async ({ request }) => {
        const body = await (await request.get('/sitemap.xml')).text();

        // security.md「全通信は HTTPS を必須とする」に反する URL が混入していないことを担保する。
        expect(body).not.toContain('<loc>http://');
    });

    test('robots.txt と sitemap.xml に旧ドメイン・プレースホルダーが残っていない', async ({
        request,
    }) => {
        const robotsBody = await (await request.get('/robots.txt')).text();
        const sitemapBody = await (await request.get('/sitemap.xml')).text();

        // 旧ドメイン introtechkk.com は失効済み。移行漏れが残るとクローラを失効ドメインへ誘導してしまう。
        // なお 'introtechkk.com' は 'introtechkkplus.com' の部分文字列ではないため誤検知しない。
        for (const body of [robotsBody, sitemapBody]) {
            expect(body).not.toContain('introtechkk.com');
            expect(body).not.toContain('your-domain.com');
            expect(body).not.toContain('localhost');
        }
    });

    test('robots.txt が指す Sitemap URL が実際に配信されている', async ({ request }) => {
        const robotsBody = await (await request.get('/robots.txt')).text();
        const sitemapLine = robotsBody.match(/^Sitemap:\s*(\S+)$/m);

        expect(sitemapLine).not.toBeNull();

        // 直前の toBeNull 検証で null でないことが確定しているため非 null アサーションを使う。
        // robots.txt の値は本番ホストの絶対 URL なので、パスだけを取り出してテスト対象サーバに問い合わせる。
        const sitemapPath = new URL(sitemapLine![1]).pathname;
        const response = await request.get(sitemapPath);

        expect(response.status()).toBe(200);
    });
});
