import { test, expect } from '@playwright/test';

// 配色テーマは Cookie を読んで**サーバー側で**解決し、初期 HTML に data-theme を載せる。
// クライアントで適用すると「一度ライトで描画してからダークへ切り替わる」ちらつきが出るため、
// ここでは JS を一切実行しない request 経由で HTML を取り、属性が入っていることを確かめる。
//
// 属性の出力先は issue #138 で `client.tsx` のラッパー要素から `<html>`（`layout.tsx`）へ移した。
// `<html>` でないと `color-scheme` がブラウザ既定の部品（スクロールバー・入力欄）へ効かないため。

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

test.describe('配色テーマの切り替え（正常系）', () => {
    test('トグルで切り替え、リロード後も選択が保持される', async ({ page }) => {
        await page.route(/placehold\.co/, (route) => route.abort());
        await page.goto('/');

        // 切り替え前は Cookie が無いため OS 設定に委ねる（属性なし）。
        await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.*/);

        await page.getByRole('button', { name: 'ダークテーマに切り替える' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

        // リロードしてもサーバーが Cookie を読んで初期 HTML に載せ直す。
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

        await page.getByRole('button', { name: 'ライトテーマに切り替える' }).click();
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    });

    test('テーマに応じて配色トークンの実効値が変わる', async ({ page }) => {
        await page.route(/placehold\.co/, (route) => route.abort());
        await page.goto('/');

        await page.getByRole('button', { name: 'ダークテーマに切り替える' }).click();
        const dark = await page.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue('--paper').trim(),
        );

        await page.getByRole('button', { name: 'ライトテーマに切り替える' }).click();
        const light = await page.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue('--paper').trim(),
        );

        // トークンが実際に入れ替わっていること（クラス名だけ変わって色が同じ、を防ぐ）。
        expect(dark).toBe('#14130f');
        expect(light).toBe('#faf8f3');
    });

    test('スクロールバーと入力部品の配色も追従する', async ({ page }) => {
        await page.route(/placehold\.co/, (route) => route.abort());
        await page.goto('/');

        await page.getByRole('button', { name: 'ダークテーマに切り替える' }).click();

        // color-scheme は <html> に無いとブラウザ既定の部品へ効かない。
        await expect
            .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).colorScheme))
            .toBe('dark');
    });
});
