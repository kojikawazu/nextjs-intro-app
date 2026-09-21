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

test.describe('縦の余白リズム', () => {
    /**
     * 見えている縦の空きを測る。
     *
     * `padding` の値ではなく**実際に空いている距離**で確かめる。クラス名を検査すると
     * 「クラスは変わっていないが親の余白が増えて広がった」種類の退行を見逃すため。
     *
     * @param page - Playwright のページ
     * @returns セクション間・経歴カード間の空き（px）
     */
    async function measureGaps(page: import('@playwright/test').Page) {
        return page.evaluate(() => {
            const gap = (a: Element, b: Element) =>
                Math.round(b.getBoundingClientRect().top - a.getBoundingClientRect().bottom);
            const cards = document.querySelectorAll('#career article');
            return {
                aboutToCareer: gap(
                    document.querySelector('#about .grid')!,
                    document.querySelector('#career h2')!,
                ),
                careerCard: gap(cards[0], cards[1]),
            };
        });
    }

    // --- 正常系 ---
    test('セクション間の空きは経歴カード間のちょうど 2 倍になる', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Career', exact: true })).toBeVisible();

        // 空きが 12（段落）-> 28（グリッド行）-> 40（カード）-> 80（セクション）と倍で
        // 積み上がることで、どこが切れ目かを空き幅だけで読み取れる（issue #145）。
        // 比で固定しているのは、両方を同時に動かす意図的な調整は通し、
        // 片方だけ動く事故を落とすため。
        const gaps = await measureGaps(page);

        expect(gaps.careerCard).toBe(40);
        expect(gaps.aboutToCareer).toBe(gaps.careerCard * 2);
    });

    // --- 準正常系（狭い画面）---
    test('モバイル幅でも空きの比は保たれる', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Career', exact: true })).toBeVisible();

        const gaps = await measureGaps(page);

        // lg 未満ではセクションの余白だけ 1 段落ちる（32px x 2 = 64px）。
        expect(gaps.careerCard).toBe(40);
        expect(gaps.aboutToCareer).toBe(64);
    });

    // --- 異常系 ---
    test('どの幅でも横スクロールが出ない', async ({ page }) => {
        for (const width of [390, 768, 1280]) {
            await page.setViewportSize({ width, height: 900 });
            await page.goto('/');
            await expect(page.getByRole('heading', { name: 'Career', exact: true })).toBeVisible();

            const overflow = await page.evaluate(() => ({
                scroll: document.documentElement.scrollWidth,
                client: document.documentElement.clientWidth,
            }));
            expect(overflow.scroll, `${width}px で横スクロールが出ている`).toBeLessThanOrEqual(
                overflow.client,
            );
        }
    });
});
