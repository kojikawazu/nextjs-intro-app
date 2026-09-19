import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');

/** お問い合わせメールの本文を組み立てるための入力値。 */
interface ContactEmailData {
    /** 送信者の名前。件名と本文に差し込む */
    name: string;
    /** 送信者のメールアドレス。`replyTo` に設定され、受信者がそのまま返信できる */
    email: string;
    /** 問い合わせメッセージ本文 */
    message: string;
}

/**
 * お問い合わせ内容を Resend 経由で運用者宛にメール送信する。
 *
 * **例外を呼び出し側に投げない。** 環境変数の未設定・Resend の API エラー・想定外の例外は
 * すべて内部で捕捉し、`success: false` と `error` を持つオブジェクトとして返す。
 * 呼び出し側（`api/contact/route.ts`）は `result.success` で分岐すればよく、try/catch を要さない。
 *
 * エラー詳細のログ出力は `NODE_ENV === 'development'` のときだけ行う。本番では送信失敗の
 * 詳細が一切ログに残らないため、`error-handling.md`「エラー時はスタックトレースを含むログを
 * 出力する」とは逆方向であり、本番で発生した送信失敗の調査は難しい。
 *
 * @param data - 送信者名・返信先アドレス・本文
 * @returns 送信結果。成功時は `success: true` と `messageId`、失敗時は `success: false` と `error`
 */
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

        // Resend は HTTP エラー時に例外ではなく { data: null, error } を返す。
        // ここで検知しないと送信失敗を成功として扱ってしまう。
        if (result.error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Resend API returned an error:', result.error);
            }
            return {
                success: false,
                error: result.error.message || 'Resend API error',
            };
        }

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

/**
 * Resend の設定が使える状態かを確認する。
 *
 * **現在どこからも呼び出されていない**（手動デバッグ用に残されている）。
 * また Resend にヘルスチェック用エンドポイントが無いため、**実際の疎通は行わず**
 * `RESEND_API_KEY` の有無と `re_` プレフィックスの形式検証だけを行う。
 * キーが失効していてもここでは検出できない。
 *
 * @returns API キーが設定され形式も正しければ `true`、そうでなければ `false`
 */
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
