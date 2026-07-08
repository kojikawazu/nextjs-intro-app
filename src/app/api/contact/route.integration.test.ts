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
        expect((await res.json()).error).toBe('すべての項目を入力してください');
    });

    it('不正なメール形式は 400 を返す', async () => {
        const res = await POST(contactRequest({ ...validPayload, email: 'invalid' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('有効なメールアドレスを入力してください');
    });

    it('5000文字超のメッセージは 400 を返す', async () => {
        const res = await POST(contactRequest({ ...validPayload, message: 'a'.repeat(5001) }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('メッセージは5000文字以内で入力してください');
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
