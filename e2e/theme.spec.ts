import { test, expect } from '@playwright/test';

// 配色テーマは Cookie を読んで**サーバー側で**解決し、初期 HTML に data-theme を載せる。
// クライアントで適用すると「一度ライトで描画してからダークへ切り替わる」ちらつきが出るため、
// ここでは JS を一切実行しない request 経由で HTML を取り、属性が入っていることを確かめる。
//
// なお issue #136 時点では、この属性を参照する CSS はまだどのコンポーネントにも
// 適用されていない（配色トークンの定義のみ）。表示は変わらないが、機構は動いている。

/**
 * Cookie を付けてトップページの HTML を取得する。
 *
 * @param request - Playwright の request フィクスチャ
 * @param cookie - 送る Cookie 文字列。未指定なら Cookie を送らない
 * @returns レスポンスボディの HTML
 */
async function fetchHomeHtml(
    request: {
        get: (
            url: string,
            options?: { headers?: Record<string, string> },
        ) => Promise<{ text: () => Promise<string> }>;
    },
    cookie?: string,
): Promise<string> {
    const response = await request.get('/', cookie ? { headers: { Cookie: cookie } } : undefined);
    return response.text();
}

test.describe('配色テーマの解決（正常系）', () => {
    test('theme=dark を送ると初期 HTML に data-theme="dark" が入る', async ({ request }) => {
        const html = await fetchHomeHtml(request, 'theme=dark');

        expect(html).toContain('data-theme="dark"');
        expect(html).not.toContain('data-theme="light"');
    });

    test('theme=light を送ると初期 HTML に data-theme="light" が入る', async ({ request }) => {
        const html = await fetchHomeHtml(request, 'theme=light');

        expect(html).toContain('data-theme="light"');
        expect(html).not.toContain('data-theme="dark"');
    });
});

test.describe('配色テーマの解決（準正常系）', () => {
    test('Cookie が無ければ data-theme を出さない（OS 設定に委ねる）', async ({ request }) => {
        const html = await fetchHomeHtml(request);

        expect(html).not.toContain('data-theme=');
    });

    test('未知の値は無視して data-theme を出さない', async ({ request }) => {
        const html = await fetchHomeHtml(request, 'theme=sepia');

        expect(html).not.toContain('data-theme=');
    });

    test('大文字の値は受け付けない（CSS セレクタと厳密に一致させるため）', async ({ request }) => {
        const html = await fetchHomeHtml(request, 'theme=Dark');

        expect(html).not.toContain('data-theme=');
    });
});

test.describe('配色テーマの解決（異常系）', () => {
    test('属性を注入しようとする値でも data-theme を出さない', async ({ request }) => {
        const html = await fetchHomeHtml(request, 'theme=dark%22%20onload%3D%22alert(1)');

        expect(html).not.toContain('onload');
        expect(html).not.toContain('data-theme=');
    });

    test('他の Cookie が混ざっていても theme だけを読む', async ({ request }) => {
        const html = await fetchHomeHtml(request, 'other=dark; theme=light; another=dark');

        expect(html).toContain('data-theme="light"');
    });

    test('ブラウザで開いてもハイドレーション後に属性が変わらない', async ({ page, context }) => {
        // サーバーが出した値をクライアントが上書きすると、React の hydration mismatch と
        // ちらつきの両方が起きる。描画完了後も同じ値であることを確認する。
        await context.addCookies([{ name: 'theme', value: 'dark', url: 'http://127.0.0.1:3000' }]);
        await page.route(/placehold\.co/, (route) => route.abort());

        await page.goto('/');
        await expect(
            page.getByRole('heading', { name: 'Solving Problems with Technology' }),
        ).toBeVisible();

        await expect(page.locator('[data-theme]')).toHaveAttribute('data-theme', 'dark');
    });
});
