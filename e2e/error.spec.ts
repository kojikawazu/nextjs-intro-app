import { test, expect } from '@playwright/test';

test.describe('ポートフォリオ取得失敗（異常系）', () => {
    test('取得失敗時はエラー画面と Reload ボタンが表示される', async ({ page }) => {
        await page.route(/placehold\.co/, (route) => route.abort());
        // /api/portfolio を 500 にしてデータ取得失敗を再現する。
        await page.route('**/api/portfolio', (route) =>
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Failed to fetch portfolio data' }),
            }),
        );

        await page.goto('/');

        await expect(page.getByText('Failed to load portfolio data')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reload Page' })).toBeVisible();
    });
});
