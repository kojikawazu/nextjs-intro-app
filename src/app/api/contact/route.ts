import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/repositories/resend';
import { ContactFormSchema } from '@/schemas/contact';
import { logError } from '@/lib/logger';
import type { ApiErrorResponse } from '@/types/api-error';

/**
 * お問い合わせフォームの送信を受け付け、Resend でメールを送る。
 *
 * 入力検証はクライアントと同じ `ContactFormSchema` で行う。フォームを経由しない直接
 * リクエストにも同じ制約（`name` 2〜50 文字 / `email` 255 文字以内 / `message` 10〜2000 文字）が
 * 効く。信頼境界が異なるためクライアント側と検証が重複するが、これは `frontend.md` が
 * 求める必要な重複であり、スキーマを共有することでルール自体の二重定義は避けている。
 *
 * エラーメッセージは Zod の先頭 issue を返す。`criteriaMode` 相当の分岐は持たず、
 * レスポンス形は `ApiErrorResponse` で統一する（`error-handling.md`「統一エラーレスポンス」）。
 *
 * @param request - お問い合わせ内容（`name` / `email` / `message`）を JSON ボディに持つリクエスト
 * @returns 成功時は 200 で `success` と `messageId`、入力不正・JSON 不正は 400、送信失敗・想定外エラーは 500
 */
export async function POST(request: NextRequest) {
    try {
        // 外部入力は unknown として受け、Zod で parse してから使う
        // （coding-standards.md「外部入力は unknown で受け、Zod で parse してから内部で使う」）。
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            // ボディが JSON として壊れているのはクライアント起因のため 400 で返す。
            const body: ApiErrorResponse = { error: 'リクエストの形式が不正です' };
            return NextResponse.json(body, { status: 400 });
        }

        const parsed = ContactFormSchema.safeParse(body);
        if (!parsed.success) {
            const body: ApiErrorResponse = { error: parsed.error.issues[0].message };
            return NextResponse.json(body, { status: 400 });
        }

        const { name, email, message } = parsed.data;

        // Send email using Resend
        const result = await sendContactEmail({ name, email, message });

        if (!result.success) {
            // 送信失敗の原因は本番でも残す。開発時だけの出力では、実際に問い合わせが
            // 届かなかったときに何も手がかりが残らない。
            logError('contact: メール送信に失敗', undefined, { reason: result.error });
            const body: ApiErrorResponse = {
                error: 'メールの送信に失敗しました。しばらくしてからもう一度お試しください。',
            };
            return NextResponse.json(body, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'お問い合わせありがとうございます。確認次第、ご連絡させていただきます。',
            messageId: result.messageId,
        });
    } catch (error) {
        logError('contact: 想定外のエラー', error);

        const body: ApiErrorResponse = {
            error: 'サーバーエラーが発生しました。しばらくしてからもう一度お試しください。',
        };
        return NextResponse.json(body, { status: 500 });
    }
}
