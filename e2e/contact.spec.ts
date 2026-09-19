import { test, expect } from '@playwright/test';

const validInput = {
    name: '山田太郎',
    email: 'taro@example.com',
    message: 'E2E テストのお問い合わせです。よろしくお願いします。',
};

// ページ表示自体は GCS コンテナの実データを使う。送信の成否のみブラウザ側でスタブする
// （Resend にはエミュレータが無く、E2E で実メール送信もできないため）。
test.beforeEach(async ({ page }) => {
    await page.route(/placehold\.co/, (route) => route.abort());
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Contact', exact: true })).toBeVisible();
});

// フォームへ有効値を入力する。
async function fillValidForm(page: import('@playwright/test').Page) {
    await page.locator('input[name="name"]').fill(validInput.name);
    await page.locator('input[name="email"]').fill(validInput.email);
    await page.locator('textarea[name="message"]').fill(validInput.message);
}

test.describe('お問い合わせフォームのアクセシビリティ', () => {
    // --- 正常系 ---
    test('ラベルをクリックすると対応する入力欄にフォーカスが移る', async ({ page }) => {
        // 属性の有無ではなく「実際に関連付けが機能するか」で検証する。
        // <label> を描画していても htmlFor / id が無ければフォーカスは移らない。
        for (const [labelText, selector] of [
            ['お名前', 'input[name="name"]'],
            ['メールアドレス', 'input[name="email"]'],
            ['お問い合わせ内容', 'textarea[name="message"]'],
        ] as const) {
            await page.getByText(labelText, { exact: false }).first().click();
            await expect(page.locator(selector)).toBeFocused();
        }
    });

    test('入力欄がアクセシブルネームを持つ', async ({ page }) => {
        // 関連付けがあれば、ラベル文字列がそのままアクセシブルネームになる。
        await expect(page.getByLabel('お名前')).toBeVisible();
        await expect(page.getByLabel('メールアドレス')).toBeVisible();
        await expect(page.getByLabel('お問い合わせ内容')).toBeVisible();
    });

    // --- 準正常系（検証エラー時）---
    test('検証エラー時に aria-invalid が立ち、エラー文が入力欄に紐付く', async ({ page }) => {
        await page.locator('input[name="name"]').fill('a');
        await page.locator('input[name="email"]').fill('taro@example.com');
        await page.locator('textarea[name="message"]').fill('短い文');
        await page.getByRole('button', { name: '上記内容で送信する' }).click();

        const nameInput = page.locator('input[name="name"]');
        await expect(nameInput).toHaveAttribute('aria-invalid', 'true');

        // aria-describedby が指す要素に、実際のエラー文が入っていることまで確認する。
        const describedBy = await nameInput.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        await expect(page.locator(`#${describedBy}`)).toHaveText(
            'お名前は2文字以上で入力してください',
        );
    });

    // --- 異常系（送信失敗時）---
    test('送信失敗時のエラーが role="alert" で通知される', async ({ page }) => {
        await page.route('**/api/contact', (route) =>
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'メールの送信に失敗しました。' }),
            }),
        );

        await fillValidForm(page);
        await page.getByRole('button', { name: '上記内容で送信する' }).click();

        // Next.js はルート遷移の読み上げ用に role="alert" の要素（#__next-route-announcer__）を
        // body 直下へ注入するため、getByRole('alert') だけでは 2 件にマッチして曖昧になる。
        // フォーム内に限定して、送信エラーが alert として通知されることを確かめる。
        await expect(page.locator('form').getByRole('alert')).toContainText(
            'メールの送信に失敗しました。',
        );
    });
});

test.describe('お問い合わせフォーム', () => {
    // --- 準正常系（HTML の required は満たすが zod のクライアントバリデーションで弾く。API は呼ばれない）---
    // 注: 空欄はブラウザのネイティブ required 検証が submit をブロックするため、
    // zod のカスタムメッセージは「非空だが短すぎる」入力でのみ観測できる。
    test('短すぎる入力はバリデーションエラーが表示される', async ({ page }) => {
        await page.locator('input[name="name"]').fill('a'); // 1 文字（min 2 違反）
        await page.locator('input[name="email"]').fill('taro@example.com'); // 有効
        await page.locator('textarea[name="message"]').fill('短い文'); // 10 文字未満

        await page.getByRole('button', { name: '上記内容で送信する' }).click();

        await expect(page.getByText('お名前は2文字以上で入力してください')).toBeVisible();
        await expect(
            page.getByText('お問い合わせ内容は10文字以上で入力してください'),
        ).toBeVisible();
    });

    // --- 正常系（/api/contact を 200 でスタブ）---
    test('正常入力で送信すると完了画面が表示される', async ({ page }) => {
        await page.route('**/api/contact', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, message: 'ok', messageId: 'e2e-id' }),
            }),
        );

        await fillValidForm(page);
        await page.getByRole('button', { name: '上記内容で送信する' }).click();

        await expect(page.getByRole('heading', { name: '送信完了' })).toBeVisible();
        await expect(page.getByText('お問い合わせありがとうございます。')).toBeVisible();
    });

    // --- 異常系（/api/contact が 500）---
    test('送信が失敗するとエラーメッセージが表示される', async ({ page }) => {
        await page.route('**/api/contact', (route) =>
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'メールの送信に失敗しました。しばらくしてからもう一度お試しください。',
                }),
            }),
        );

        await fillValidForm(page);
        await page.getByRole('button', { name: '上記内容で送信する' }).click();

        await expect(
            page.getByText('メールの送信に失敗しました。しばらくしてからもう一度お試しください。'),
        ).toBeVisible();
    });
});
