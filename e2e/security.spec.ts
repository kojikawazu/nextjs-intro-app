import { test, expect } from '@playwright/test';

// CSP は src/middleware.ts がリクエストごとに組み立てる。ヘッダーの存在だけでなく
// 「ブラウザが実際に違反を報告しないか」まで見ないと、実質無効な CSP を通してしまう。
test.describe('セキュリティヘッダー（正常系）', () => {
    test('固定のセキュリティヘッダーが付与される', async ({ request }) => {
        const response = await request.get('/');

        expect(response.headers()['x-content-type-options']).toBe('nosniff');
        expect(response.headers()['x-frame-options']).toBe('DENY');
        expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
        expect(response.headers()['strict-transport-security']).toBe(
            'max-age=31536000; includeSubDomains',
        );
    });

    test('CSP に nonce と strict-dynamic が含まれる', async ({ request }) => {
        const response = await request.get('/');
        const csp = response.headers()['content-security-policy'];

        expect(csp).toContain("'strict-dynamic'");
        expect(csp).toMatch(/script-src [^;]*'nonce-[^']+'/);
        expect(csp).toContain("frame-ancestors 'none'");
        expect(csp).toContain("object-src 'none'");
        // 本番ビルドでは eval を許可しない（開発サーバー向けの緩和が漏れていないこと）。
        expect(csp).not.toContain("'unsafe-eval'");
    });

    test('nonce はリクエストごとに変わる', async ({ request }) => {
        const extractNonce = async () => {
            const csp = (await request.get('/')).headers()['content-security-policy'];
            return /'nonce-([^']+)'/.exec(csp)?.[1];
        };

        const first = await extractNonce();
        const second = await extractNonce();

        expect(first).toBeTruthy();
        expect(second).not.toBe(first);
    });
});

test.describe('CSP の適用範囲（準正常系）', () => {
    // nonce ベース CSP は動的レンダリングされるページにしか当てられない。静的プリレンダー
    // された HTML には nonce を差し込めず、strict-dynamic 下では全スクリプトが落ちる。
    // 実際、広いマッチャでは 404 ページが壊れた。ここはその回帰ガード。
    test('静的プリレンダーされる 404 ページには CSP を付けない', async ({ request }) => {
        const response = await request.get('/no-such-page');

        expect(response.status()).toBe(404);
        expect(response.headers()['content-security-policy']).toBeUndefined();
        // CSP の対象外でも、固定のセキュリティヘッダーは付く（next.config.js 側の担当）。
        expect(response.headers()['x-frame-options']).toBe('DENY');
    });

    test('404 ページのスクリプトがブロックされない', async ({ page }) => {
        const violations: string[] = [];
        page.on('console', (message) => {
            if (message.text().includes('Content Security Policy')) {
                violations.push(message.text());
            }
        });

        await page.goto('/no-such-page');

        expect(violations).toEqual([]);
    });
});

test.describe('CSP 適用下の描画（正常系）', () => {
    test('CSP 違反なしでハイドレーションが完了する', async ({ page }) => {
        const violations: string[] = [];
        page.on('console', (message) => {
            const text = message.text();
            if (text.includes('Content Security Policy')) {
                violations.push(text);
            }
        });

        await page.goto('/');

        // Next.js が出力する script すべてに nonce が付いていること。
        // 1 つでも欠けると strict-dynamic 下でハイドレーションが止まる。
        const scriptCounts = await page.evaluate(() => ({
            total: document.querySelectorAll('script').length,
            withNonce: document.querySelectorAll('script[nonce]').length,
        }));
        expect(scriptCounts.total).toBeGreaterThan(0);
        expect(scriptCounts.withNonce).toBe(scriptCounts.total);

        // クライアント state の更新が効く＝ハイドレーション済み。
        const loadMore = page.getByRole('button', { name: 'and more...' });
        const before = await page.locator('h3').count();
        await loadMore.click();
        await expect(page.locator('h3')).not.toHaveCount(before);

        expect(violations).toEqual([]);
    });
});
