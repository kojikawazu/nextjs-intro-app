import { test, expect } from '@playwright/test';

// 外部画像（placehold.co）は E2E をヘルメティックに保つため中断する。
test.beforeEach(async ({ page }) => {
    await page.route(/placehold\.co/, (route) => route.abort());
});

test.describe('ホーム（正常系：GCS コンテナの実データ経路）', () => {
    test('全セクションとフッターが表示される', async ({ page }) => {
        await page.goto('/');

        // Hero はサーバー側でデータを取得できた場合のみ描画される＝GCS コンテナからの取得成功を意味する。
        // 取得に失敗していれば error.tsx が描画され、この見出しは存在しない。
        await expect(
            page.getByRole('heading', { name: 'Solving Problems with Technology' }),
        ).toBeVisible();
        await expect(page.getByRole('heading', { name: 'About', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Career', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Contact', exact: true })).toBeVisible();

        // フッターの著作権（データ駆動）
        await expect(page.getByText('© 2024 TechProfile Pro. All rights reserved.')).toBeVisible();
    });

    test('ヘッダーナビで Contact セクションへスクロールする', async ({ page }) => {
        await page.goto('/');
        await expect(
            page.getByRole('heading', { name: 'Solving Problems with Technology' }),
        ).toBeVisible();

        await page.locator('header').getByRole('button', { name: 'Contact' }).click();
        await expect(page.locator('#contact')).toBeInViewport({ timeout: 10_000 });
    });
});
