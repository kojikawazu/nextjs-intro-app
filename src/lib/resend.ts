import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');

interface ContactEmailData {
    name: string;
    email: string;
    message: string;
}

export async function sendContactEmail(data: ContactEmailData) {
    try {
        const { name, email, message } = data;

        // Validate environment variables
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured');
        }

        if (!process.env.MY_MAIL_ADDRESS) {
            throw new Error('MY_MAIL_ADDRESS is not configured');
        }

        if (!process.env.RESEND_FROM_EMAIL) {
            throw new Error('RESEND_FROM_EMAIL is not configured');
        }

        const fromEmail = process.env.RESEND_FROM_EMAIL;

        // Send email using Resend
        const result = await resend.emails.send({
            from: fromEmail,
            replyTo: data.email,
            to: [process.env.MY_MAIL_ADDRESS],
            subject: `ポートフォリオサイトからのお問い合わせ - ${name}様`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">
            新しいお問い合わせ
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #475569; margin-top: 0;">お客様情報</h3>
            <p><strong>お名前:</strong> ${name}</p>
            <p><strong>メールアドレス:</strong> ${email}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
            <h3 style="color: #475569; margin-top: 0;">メッセージ内容</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>このメールはポートフォリオサイトのお問い合わせフォームから自動送信されました。</p>
            <p>送信日時: ${new Date().toLocaleString('ja-JP', {
                timeZone: 'Asia/Tokyo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            })}</p>
          </div>
        </div>
      `,
            // Plain text version for email clients that don't support HTML
            text: `
新しいお問い合わせ

お客様情報:
お名前: ${name}
メールアドレス: ${email}

メッセージ内容:
${message}

送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
      `,
        });

        return {
            success: true,
            messageId: result.data?.id,
            data: result.data,
        };
    } catch (error) {
        // Log error only in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Failed to send contact email:', error);
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

export async function testResendConnection() {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured');
        }

        // Test connection by trying to get API key info
        // Note: Resend doesn't have a direct health check endpoint
        // so we'll validate the API key format
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey.startsWith('re_')) {
            throw new Error('Invalid RESEND_API_KEY format');
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Resend configuration validated');
        }
        return true;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('❌ Resend connection test failed:', error);
        }
        return false;
    }
}
