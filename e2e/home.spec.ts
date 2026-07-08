import { test, expect } from '@playwright/test';

// 外部画像（placehold.co）は E2E をヘルメティックに保つため中断する。
test.beforeEach(async ({ page }) => {
    await page.route(/placehold\.co/, (route) => route.abort());
});

test.describe('ホーム（正常系：GCS コンテナの実データ経路）', () => {
    test('全セクションとフッターが表示される', async ({ page }) => {
        await page.goto('/');

        // Hero はデータ取得完了後にのみ描画される＝GCS コンテナからの取得成功を意味する。
        await expect(
            page.getByRole('heading', { name: 'Solving Problems with Technology' }),
        ).toBeVisible();
        await expect(page.getByRole('heading', { name: 'About', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Career', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Skills', exact: true })).toBeVisible();
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

    test('Skills の「and more...」で全カードが表示される', async ({ page }) => {
        await page.goto('/');

        const moreButton = page.getByRole('button', { name: 'and more...' });
        await expect(moreButton).toBeVisible();
        await moreButton.click();

        // 12 件（初期 9 + 6）→ 全表示 → ボタン消滅 + skills_more テキスト。
        await expect(moreButton).toBeHidden();
        await expect(page.getByText('ほかにも幅広い技術スタックに対応しています。')).toBeVisible();
    });
});
