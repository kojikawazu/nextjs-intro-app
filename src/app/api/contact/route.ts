import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/resend';

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
