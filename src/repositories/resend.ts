import { Resend } from 'resend';
import { escapeHtml } from '@/lib/html-escape';
import { sanitizeHeaderValue } from '@/lib/mail-header';
import { logError } from '@/lib/logger';

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
 * 本文の HTML パートへ埋め込む値は `escapeHtml` を通す。Zod の検証は「受け付けてよい値か」の
 * 判定であって出力先の文法に合わせる処理ではないため、検証を通った値でもエスケープは必要
 * （`security.md`「XSS: ... 出力エスケープの多層防御」）。
 *
 * 件名へ差し込む送信者名は `sanitizeHeaderValue` を通す。メールヘッダーは CRLF 区切りのため、
 * 生の改行が混ざるとヘッダーインジェクションに繋がり得る。HTML エスケープは件名には不適切
 * （実体参照がそのまま読者に見える）なので、別の処理として分けている（docs/06 §8.3）。
 *
 * 送信失敗は `logError` で**本番でも**記録する。開発時だけの出力では、実際に問い合わせが
 * 届かなかったときに何も手がかりが残らない（`error-handling.md`「エラー時はスタックトレースを
 * 含むログを出力する」）。**本文・送信者名・メールアドレスはログに含めない**（個人情報のため）。
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

        // HTML パートへ埋め込む値は実体参照へ変換しておく。件名と text パートは
        // HTML として解釈されないため、エスケープすると実体参照がそのまま読者に見える。
        const escapedName = escapeHtml(name);
        const escapedEmail = escapeHtml(email);
        const escapedMessage = escapeHtml(message);

        // 件名はヘッダーであり HTML ではない。エスケープではなく制御文字の除去を行う。
        const subjectName = sanitizeHeaderValue(name);

        // Send email using Resend
        const result = await resend.emails.send({
            from: fromEmail,
            replyTo: data.email,
            to: [process.env.MY_MAIL_ADDRESS],
            subject: `ポートフォリオサイトからのお問い合わせ - ${subjectName}様`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">
            新しいお問い合わせ
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #475569; margin-top: 0;">お客様情報</h3>
            <p><strong>お名前:</strong> ${escapedName}</p>
            <p><strong>メールアドレス:</strong> ${escapedEmail}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
            <h3 style="color: #475569; margin-top: 0;">メッセージ内容</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${escapedMessage}</p>
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
            // Plain text version for email clients that don't support HTML.
            // text/plain は HTML として解釈されないため、ここは未エスケープの生値でよい。
            // 実体参照へ変換すると `&amp;` 等がそのまま読者に見えてしまう。
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
            logError('resend: API がエラーを返した', undefined, {
                name: result.error.name,
                reason: result.error.message,
            });
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
        logError('resend: メール送信に失敗', error);

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}
