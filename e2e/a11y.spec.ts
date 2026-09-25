import { test, expect } from '@playwright/test';

// フォームのアクセシビリティ（ラベル・aria-invalid・role="alert"）は contact.spec.ts が担う。
// ここはページ全体のキーボード操作と、文書の言語宣言を見る。

// 外部画像（placehold.co）は E2E をヘルメティックに保つため中断する。
test.beforeEach(async ({ page }) => {
    await page.route(/placehold\.co/, (route) => route.abort());
});

/**
 * フォーカス中の要素に、目に見えるフォーカス表示があるかを判定する（ブラウザ内で評価する）。
 *
 * **outline のスタイルだけで判定してはいけない。** Tailwind 3 の `outline-none` は
 * `outline: 2px solid transparent`（Windows のハイコントラストモード向け）であり、
 * スタイルは `solid` のまま色だけが透明になる。したがって outline は色の透明度まで、
 * ring（`box-shadow`）は広がりかぼかしを持つ不透明な層があるかで見る。
 *
 * @returns 見えるフォーカス表示が無い場合はその要素の説明、ある場合は `null`
 */
function describeMissingFocusIndicator(): string | null {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;

    const isTransparent = (color: string) =>
        color === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(color) || /\/\s*0\)$/.test(color);

    const style = getComputedStyle(el);
    const hasOutline =
        style.outlineStyle !== 'none' &&
        parseFloat(style.outlineWidth) > 0 &&
        !isTransparent(style.outlineColor);

    // `box-shadow` は層をカンマで区切る。色関数の引数内のカンマでは分割しない。
    const hasRing =
        style.boxShadow !== 'none' &&
        style.boxShadow.split(/,(?![^(]*\))/).some((layer) => {
            const color = /^\s*([a-z]+\([^)]*\)|[a-z]+)/.exec(layer)?.[1] ?? '';
            // 並びは x / y / blur / spread。blur か spread が 0 より大きければ輪郭が出る。
            const [, , blur = 0, spread = 0] = (layer.match(/-?[\d.]+px/g) ?? []).map(parseFloat);
            return !isTransparent(color) && (blur > 0 || spread > 0);
        });

    if (hasOutline || hasRing) return null;
    const name = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40);
    return `${el.tagName.toLowerCase()}「${name}」`;
}

test.describe('キーボード操作', () => {
    // --- 正常系 ---
    test('Tab キーでヘッダーのナビ、テーマ切替の順にフォーカスが移る', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto('/');

        // ロゴはテキストのみでフォーカスを受けないため、最初の Tab はナビの先頭へ入る。
        for (const name of [
            'About',
            'Career',
            'AI',
            'Product',
            'Articles',
            'Contact',
            'ライトテーマに切り替える',
            'ダークテーマに切り替える',
        ]) {
            await page.keyboard.press('Tab');
            await expect(page.locator(':focus')).toHaveAccessibleName(name);
        }
    });

    // --- 準正常系 ---
    test('Tab で巡るすべての要素にフォーカス表示が見える', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Contact', exact: true })).toBeVisible();

        // 多くの部品が outline を消して ring で代替している。ring の指定が抜けると
        // フォーカス位置が見えなくなるが、jsdom は CSS を計算しないため UT では検出できない。
        const missing: string[] = [];
        let visited = 0;
        // 上限は現在のフォーカス可能要素（23 件）に余裕を持たせた値。無限ループ防止のみが目的。
        for (let i = 0; i < 100; i++) {
            await page.keyboard.press('Tab');
            const isBody = await page.evaluate(() => document.activeElement === document.body);
            if (isBody) break;
            visited++;
            const result = await page.evaluate(describeMissingFocusIndicator);
            if (result) missing.push(result);
        }

        // 一巡しきれず途中で止まっていないこと（末尾の送信ボタンまで到達している）を件数で確かめる。
        expect(visited).toBeGreaterThanOrEqual(20);
        expect(missing, 'フォーカス表示が見えない要素').toEqual([]);
    });

    test('モバイル幅で Tab からハンバーガーを開ける', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');

        // 横並びナビは display: none のため Tab 順から外れ、テーマ切替の次がハンバーガーになる。
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        const hamburger = page.locator(':focus');
        await expect(hamburger).toHaveAccessibleName('メニューを開く');

        await page.keyboard.press('Enter');
        await expect(hamburger).toHaveAttribute('aria-expanded', 'true');

        // 開いたメニューの先頭項目へ Tab で入れる（キーボードだけで選択まで届く）。
        await page.keyboard.press('Tab');
        await expect(page.locator(':focus')).toHaveAccessibleName('About');
    });
});

test.describe('文書の言語宣言', () => {
    // request フィクスチャは JavaScript を実行しないため、クローラやスクリーンリーダーが
    // 最初に受け取る HTML そのものを検証できる。
    const HTML_LANG_JA = /<html[^>]*\slang="ja"/;

    // --- 正常系 ---
    test('トップページの初期 HTML が lang="ja" を宣言する', async ({ request }) => {
        const html = await (await request.get('/')).text();

        expect(html).toMatch(HTML_LANG_JA);
    });

    // --- 準正常系 ---
    test('404 ページの初期 HTML も lang="ja" を宣言する', async ({ request }) => {
        // 404 は静的プリレンダーされ、トップとは別経路で HTML が作られる（security.spec.ts 参照）。
        const response = await request.get('/no-such-page');

        expect(response.status()).toBe(404);
        expect(await response.text()).toMatch(HTML_LANG_JA);
    });
});
