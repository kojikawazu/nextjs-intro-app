import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';

/**
 * `fetch` を差し替え、`POST /api/contact` の応答を制御する。
 *
 * モックするのは **HTTP 通信だけ**（`testing.md`「モックは外部 I/O のみ」）。
 * Zod による検証も react-hook-form の状態遷移も実物が動く。
 *
 * @param response - 返させる応答
 * @param response.ok - HTTP が成功扱いか。false なら送信失敗として扱われる
 * @param response.body - `json()` が解決する本文
 * @returns `fetch` の spy
 */
function stubFetch(response: { ok: boolean; body: unknown }) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: response.ok,
        json: async () => response.body,
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

/**
 * 有効な入力でフォームを埋める。
 *
 * 3 フィールドすべてが検証を通らないと送信処理へ進まないため、
 * 送信後の挙動を見るテストはいずれもこの手順を必要とする。
 *
 * @param user - `userEvent.setup()` の戻り値
 */
async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/お名前/), '山田 太郎');
    await user.type(screen.getByLabelText(/メールアドレス/), 'taro@example.com');
    await user.type(screen.getByLabelText(/お問い合わせ内容/), 'ご相談したいことがあります');
}

describe('ContactForm', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    // --- 正常系 ---
    it('有効な入力を送信すると完了画面に切り替わる', async () => {
        const user = userEvent.setup();
        const fetchMock = stubFetch({ ok: true, body: { messageId: 'abc123' } });
        render(<ContactForm />);

        await fillValidForm(user);
        await user.click(screen.getByRole('button', { name: '上記内容で送信する' }));

        expect(await screen.findByText('送信完了')).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(1);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('/api/contact');
        expect(init.method).toBe('POST');
        expect(JSON.parse(init.body)).toEqual({
            name: '山田 太郎',
            email: 'taro@example.com',
            message: 'ご相談したいことがあります',
        });
    });

    // --- 準正常系（想定内の入力ミス・操作）---
    // 以下 2 件は **Zod のメッセージが出ないこと** を固定している。
    // 各項目に `required` / `type="email"` を付けているため、空欄と不正なメール形式は
    // ブラウザのネイティブ検証が submit 自体を止め、react-hook-form の handleSubmit まで
    // 到達しない。したがって `min(1)` / `.email()` のメッセージはクライアントでは表示されず、
    // 実際に効くのはサーバー側（`POST /api/contact`）の検証になる。
    // 同じ前提は `e2e/contact.spec.ts` にも記録済み。
    it('未入力のまま送信してもリクエストを飛ばさない', async () => {
        const user = userEvent.setup();
        const fetchMock = stubFetch({ ok: true, body: {} });
        render(<ContactForm />);

        await user.click(screen.getByRole('button', { name: '上記内容で送信する' }));

        expect(fetchMock).not.toHaveBeenCalled();
        expect(screen.getByLabelText(/お名前/)).toHaveProperty('validity.valueMissing', true);
        // ネイティブ検証で止まるため Zod のメッセージは出ない。
        expect(screen.queryByText('お名前は必須です')).not.toBeInTheDocument();
    });

    it('メールアドレスの形式が不正ならリクエストを飛ばさない', async () => {
        const user = userEvent.setup();
        const fetchMock = stubFetch({ ok: true, body: {} });
        render(<ContactForm />);

        await user.type(screen.getByLabelText(/お名前/), '山田 太郎');
        await user.type(screen.getByLabelText(/メールアドレス/), 'not-an-email');
        await user.type(screen.getByLabelText(/お問い合わせ内容/), 'ご相談したいことがあります');
        await user.click(screen.getByRole('button', { name: '上記内容で送信する' }));

        expect(fetchMock).not.toHaveBeenCalled();
        expect(screen.getByLabelText(/メールアドレス/)).toHaveProperty(
            'validity.typeMismatch',
            true,
        );
        expect(
            screen.queryByText('正しいメールアドレスを入力してください'),
        ).not.toBeInTheDocument();
    });

    it('文字数が下限に満たなければ文字数エラーを出す（必須エラーではなく）', async () => {
        const user = userEvent.setup();
        stubFetch({ ok: true, body: {} });
        render(<ContactForm />);

        await user.type(screen.getByLabelText(/お名前/), '山');
        await user.type(screen.getByLabelText(/メールアドレス/), 'taro@example.com');
        await user.type(screen.getByLabelText(/お問い合わせ内容/), '短い');
        await user.click(screen.getByRole('button', { name: '上記内容で送信する' }));

        // min(1) と min(2) を定義順に置き、firstError で先頭だけ出す設計を固定する。
        expect(await screen.findByText('お名前は2文字以上で入力してください')).toBeInTheDocument();
        expect(
            screen.getByText('お問い合わせ内容は10文字以上で入力してください'),
        ).toBeInTheDocument();
        expect(screen.queryByText('お名前は必須です')).not.toBeInTheDocument();
    });

    it('完了画面から「新しいお問い合わせ」で空のフォームに戻る', async () => {
        const user = userEvent.setup();
        stubFetch({ ok: true, body: { messageId: 'abc123' } });
        render(<ContactForm />);

        await fillValidForm(user);
        await user.click(screen.getByRole('button', { name: '上記内容で送信する' }));
        await screen.findByText('送信完了');

        await user.click(screen.getByRole('button', { name: '新しいお問い合わせ' }));

        expect(screen.getByLabelText(/お名前/)).toHaveValue('');
        expect(screen.getByLabelText(/お問い合わせ内容/)).toHaveValue('');
    });

    it('完了画面は支援技術へ穏やかに通知する（role="status"）', async () => {
        const user = userEvent.setup();
        stubFetch({ ok: true, body: { messageId: 'abc123' } });
        render(<ContactForm />);

        await fillValidForm(user);
        await user.click(screen.getByRole('button', { name: '上記内容で送信する' }));

        const status = await screen.findByRole('status');
        expect(status).toHaveTextContent('送信完了');
    });

    // --- 異常系（送信失敗）---
    it('サーバーがエラーを返したら理由を伝え、フォームを残す', async () => {
        const user = userEvent.setup();
        stubFetch({ ok: false, body: { error: 'メールの送信に失敗しました' } });
        render(<ContactForm />);

        await fillValidForm(user);
        await user.click(screen.getByRole('button', { name: '上記内容で送信する' }));

        // 対応を要するエラーは assertive（role="alert"）で割り込む。
        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('メールの送信に失敗しました');
        // 入力を消さない。やり直しのたびに全部打ち直させないため。
        expect(screen.getByLabelText(/お名前/)).toHaveValue('山田 太郎');
    });

    it('エラー本文が無い応答でも既定の文言を出す', async () => {
        const user = userEvent.setup();
        stubFetch({ ok: false, body: {} });
        render(<ContactForm />);

        await fillValidForm(user);
        await user.click(screen.getByRole('button', { name: '上記内容で送信する' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('メール送信に失敗しました');
    });

    it('通信そのものが失敗しても画面が壊れない', async () => {
        const user = userEvent.setup();
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));
        render(<ContactForm />);

        await fillValidForm(user);
        await user.click(screen.getByRole('button', { name: '上記内容で送信する' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Network down');
        // 失敗後もボタンは押せる状態へ戻す（isSubmitting を finally で必ず解除する）。
        await waitFor(() => {
            expect(screen.getByRole('button', { name: '上記内容で送信する' })).toBeEnabled();
        });
    });

    it('送信中はボタンを押せなくする（二重送信の防止）', async () => {
        const user = userEvent.setup();
        // 応答を保留して「送信中」で止める。
        let release: (value: unknown) => void = () => {};
        const pending = new Promise((resolve) => {
            release = resolve;
        });
        const fetchMock = vi.fn().mockReturnValue(pending);
        vi.stubGlobal('fetch', fetchMock);
        render(<ContactForm />);

        await fillValidForm(user);
        await user.click(screen.getByRole('button', { name: '上記内容で送信する' }));

        const button = await screen.findByRole('button', { name: '送信中...' });
        expect(button).toBeDisabled();

        await user.click(button);
        expect(fetchMock).toHaveBeenCalledTimes(1);

        release({ ok: true, json: async () => ({ messageId: 'abc123' }) });
        await screen.findByText('送信完了');
    });
});
