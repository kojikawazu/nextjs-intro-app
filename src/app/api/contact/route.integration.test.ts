import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/contact/route';

// Resend にはエミュレータが存在しないため、HTTP を MSW でモックする（testing.md: 外部 I/O のみモック）。
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 指定ペイロードで /api/contact への NextRequest を組み立てる。
function contactRequest(payload: unknown): NextRequest {
    return new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

const validPayload = {
    name: '山田太郎',
    email: 'taro@example.com',
    message: 'お問い合わせのテストです。よろしくお願いします。',
};

describe('POST /api/contact（route → resend / MSW モック）', () => {
    // --- 正常系 ---
    it('Resend 成功時は 200 と messageId を返す', async () => {
        server.use(
            http.post('https://api.resend.com/emails', () =>
                HttpResponse.json({ id: 'it-message-id' }, { status: 200 }),
            ),
        );

        const res = await POST(contactRequest(validPayload));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.messageId).toBe('it-message-id');
    });

    // --- 準正常系（想定内の異常入力：バリデーション。Resend は呼ばれない）---
    it('必須項目欠落は 400 を返す', async () => {
        const res = await POST(contactRequest({ name: '', email: '', message: '' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('お名前は必須です');
    });

    it('不正なメール形式は 400 を返す', async () => {
        const res = await POST(contactRequest({ ...validPayload, email: 'invalid' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('正しいメールアドレスを入力してください');
    });

    it('2000文字超のメッセージは 400 を返す', async () => {
        const res = await POST(contactRequest({ ...validPayload, message: 'a'.repeat(2001) }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('お問い合わせ内容は2000文字以内で入力してください');
    });

    // --- 準正常系（統一前はサーバー側で素通りしていた入力）---
    // 以下 4 件は ContactFormSchema を参照する前のハンドラでは 400 にならず、
    // 制約なしのままメール本文へ渡っていた。フォームを経由しない直接リクエストで効くことを固定する。
    it('50文字超の名前は 400 を返す（統一前は素通りしていた）', async () => {
        const res = await POST(contactRequest({ ...validPayload, name: 'あ'.repeat(51) }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('お名前は50文字以内で入力してください');
    });

    it('1文字の名前は 400 を返す（統一前は素通りしていた）', async () => {
        const res = await POST(contactRequest({ ...validPayload, name: 'あ' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('お名前は2文字以上で入力してください');
    });

    it('255文字超のメールアドレスは 400 を返す（統一前は素通りしていた）', async () => {
        const longEmail = `${'a'.repeat(250)}@example.com`;
        const res = await POST(contactRequest({ ...validPayload, email: longEmail }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('メールアドレスは255文字以内で入力してください');
    });

    it('10文字未満のメッセージは 400 を返す（統一前は素通りしていた）', async () => {
        const res = await POST(contactRequest({ ...validPayload, message: '短い' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('お問い合わせ内容は10文字以上で入力してください');
    });

    // --- 準正常系（HTML/スクリプトを含む入力：出力エスケープ）---
    // escapeHtml 単体の検証は src/lib/html-escape.test.ts が持つ。ここで固定したいのは
    // 「ハンドラ経由で Resend へ渡る payload が実際にエスケープ済みか」、つまり
    // 呼び出し忘れ（回帰）が起きていないこと。
    it('HTML を含む入力は html パートがエスケープされ、text パートは生値のまま送られる', async () => {
        // MSW の `request.json()` は unknown を返すため、送信 payload の形に合わせて絞り込む。
        // 実型は Resend の送信ボディだが、検証に使うのは以下 3 フィールドだけで足りる。
        let sent: { subject: string; html: string; text: string } | undefined;
        server.use(
            http.post('https://api.resend.com/emails', async ({ request }) => {
                sent = (await request.json()) as typeof sent;
                return HttpResponse.json({ id: 'it-escape-id' }, { status: 200 });
            }),
        );

        const res = await POST(
            contactRequest({
                name: '<b>山田</b>',
                email: 'taro@example.com',
                message: '<img src="x" onerror="alert(1)"> をご確認ください。',
            }),
        );
        expect(res.status).toBe(200);

        // html パート: 山括弧・クォートが実体参照へ変換され、生のタグは残らない。
        expect(sent?.html).toContain('&lt;b&gt;山田&lt;/b&gt;');
        expect(sent?.html).toContain('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
        expect(sent?.html).not.toContain('<img src="x"');
        expect(sent?.html).not.toContain('<b>山田</b>');

        // text パート: HTML として解釈されないため生値のまま送る。
        expect(sent?.text).toContain('<img src="x" onerror="alert(1)"> をご確認ください。');
        expect(sent?.text).toContain('<b>山田</b>');

        // 件名はヘッダーであり HTML ではないため、実体参照へ変換しない。
        expect(sent?.subject).toBe('ポートフォリオサイトからのお問い合わせ - <b>山田</b>様');
    });

    // --- 異常系（リクエストボディ自体が壊れている）---
    it('JSON として壊れたボディは 400 を返す', async () => {
        const req = new NextRequest('http://localhost/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{ not json',
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('リクエストの形式が不正です');
    });

    // --- 異常系（Resend API がエラーを返す）---
    it('Resend API エラー時は 500 を返す', async () => {
        server.use(
            http.post('https://api.resend.com/emails', () =>
                HttpResponse.json(
                    { name: 'application_error', message: 'Internal server error' },
                    { status: 500 },
                ),
            ),
        );

        const res = await POST(contactRequest(validPayload));
        expect(res.status).toBe(500);
        expect((await res.json()).error).toBe(
            'メールの送信に失敗しました。しばらくしてからもう一度お試しください。',
        );
    });
});
