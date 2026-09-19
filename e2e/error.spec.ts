import { test, expect } from '@playwright/test';

// このファイルは chromium-error プロジェクト（ポート 3001）で実行される。
// そのサーバは GCS_JSON_PATH に存在しないオブジェクトを指しており、
// page.tsx のサーバー側データ取得が実際に失敗する。
// ブラウザでの API スタブではなく本番と同じ経路で失敗させるため、error.tsx の描画を実証できる。
test.describe('ポートフォリオ取得失敗（異常系）', () => {
    test('取得失敗時はエラー画面と復帰ボタンが表示される', async ({ page }) => {
        await page.route(/placehold\.co/, (route) => route.abort());

        await page.goto('/');

        await expect(page.getByText('Failed to load portfolio data')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Reload Page' })).toBeVisible();
    });

    test('取得失敗時は本文セクションを描画しない', async ({ page }) => {
        await page.route(/placehold\.co/, (route) => route.abort());

        await page.goto('/');
        await expect(page.getByText('Failed to load portfolio data')).toBeVisible();

        // エラー時に中途半端な本文が出ると、空に近いページが 200 でインデックスされうる。
        await expect(
            page.getByRole('heading', { name: 'Solving Problems with Technology' }),
        ).toHaveCount(0);
    });
});
