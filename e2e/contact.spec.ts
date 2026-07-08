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
