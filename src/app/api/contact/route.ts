import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/repositories/resend';

/**
 * お問い合わせフォームの送信を受け付け、Resend でメールを送る。
 *
 * **クライアント側の `ContactFormSchema`（`src/utils/validation.ts`）を参照しておらず、
 * 検証内容が食い違っている。** 本ハンドラが行うのは以下の 3 点のみ。
 *
 * | 検証 | 本ハンドラ | ContactFormSchema |
 * |---|---|---|
 * | 必須チェック | あり | あり |
 * | メール形式 | 正規表現 | `z.string().email()` |
 * | `message` 長さ | 5000 文字以内 | 10〜2000 文字 |
 * | `name` 長さ | **なし** | 2〜50 文字 |
 * | `email` 長さ | **なし** | 255 文字以内 |
 *
 * 差異の一覧は `docs/07-api-specification.md` §4.3 が正本。上表はその要約であり、
 * どちらかを変更する場合は両方を更新すること。
 *
 * `frontend.md` は「BFF と同じ入力ルールなら同じ Zod スキーマを共有する」と定めており、
 * 統一は docs/11 タスク #49 として未着手。フォームを経由しない直接リクエストでは、
 * 上表で「なし」の制約が効かない点に注意。
 *
 * @param request - お問い合わせ内容（`name` / `email` / `message`）を JSON ボディに持つリクエスト
 * @returns 成功時は 200 で `success` と `messageId`、入力不正は 400、送信失敗・想定外エラーは 500
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, message } = body;

        // Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json({ error: 'すべての項目を入力してください' }, { status: 400 });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: '有効なメールアドレスを入力してください' },
                { status: 400 },
            );
        }

        // Validate message length
        if (message.length > 5000) {
            return NextResponse.json(
                { error: 'メッセージは5000文字以内で入力してください' },
                { status: 400 },
            );
        }

        // Send email using Resend
        const result = await sendContactEmail({ name, email, message });

        if (!result.success) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to send email:', result.error);
            }
            return NextResponse.json(
                { error: 'メールの送信に失敗しました。しばらくしてからもう一度お試しください。' },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            message: 'お問い合わせありがとうございます。確認次第、ご連絡させていただきます。',
            messageId: result.messageId,
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Contact form error:', error);
        }

        return NextResponse.json(
            { error: 'サーバーエラーが発生しました。しばらくしてからもう一度お試しください。' },
            { status: 500 },
        );
    }
}
