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

test.describe('経歴の技術スタック（正常系）', () => {
    test('技術スタックを分類ごとにまとめて表示する', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Career', exact: true })).toBeVisible();

        // 分類見出し（issue #137）ごとに、技術を 1 件ずつチップとして出す（issue #138）。
        // 見出しを持たないフラットな羅列に戻っていないことを、分類ラベルの存在で確かめる。
        await expect(page.getByText('言語', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('TypeScript', { exact: true }).first()).toBeVisible();
    });

    test('対応表に無い技術は「その他」として画面に出る', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Career', exact: true })).toBeVisible();

        // 未分類を黙って隠すとデータ追加時の取りこぼしに気づけないため、あえて表に出す設計。
        await expect(page.getByText('その他', { exact: true }).first()).toBeVisible();
    });
});
