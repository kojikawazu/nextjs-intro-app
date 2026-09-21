'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContactFormSchema, type ContactFormInput } from '@/schemas/contact';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { TextArea } from '@/components/atoms/TextArea';
import { logDebug } from '@/lib/logger';

/**
 * お問い合わせフォーム。入力・検証・送信・完了表示までを内部で完結させる。
 *
 * 検証は react-hook-form + `zodResolver(ContactFormSchema)`。`criteriaMode` は既定の
 * `firstError` のため、各フィールドで最初に失敗した制約のメッセージだけが表示される。
 *
 * 送信結果は支援技術にも通知する。完了画面はフォームと差し替わるため `role="status"`
 * （`aria-live="polite"` 相当）、送信エラーは利用者の対応を要するため `role="alert"`
 * （assertive 相当）を使い分けている。各フィールドのエラーは `Input` / `TextArea` 側で
 * `aria-describedby` / `aria-invalid` により読み上げられる。
 *
 * **`fetch('/api/contact')` をコンポーネント内から直接呼んでいる。** `frontend.md` は
 * 「`fetch` を書いてよいのは `repositories/` だけ」「クライアントコンポーネントのロジックは
 * カスタムフックへ切り出す」と定めており、現状はいずれにも従っていない。
 * 送信処理を差し替える際は呼び出し口がここ 1 箇所であることに注意。
 *
 * 状態を内部で完結させ、Atoms 側へ `register()` の `ref` を渡す側であるため
 * `forwardRef` は使わない（`docs/component-design-report/03-forward-ref.md` §2.2）。
 */
export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ContactFormInput>({
        resolver: zodResolver(ContactFormSchema),
    });

    const onSubmit = async (data: ContactFormInput) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'メール送信に失敗しました');
            }

            // result 全体ではなく messageId のみを残す。レスポンスには送信内容の
            // 確認文言が含まれるため、開発時であってもそのまま出力しない。
            logDebug('contact-form: 送信に成功', { messageId: result.messageId });
            setIsSubmitted(true);
            reset();
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : '送信に失敗しました。しばらく時間をおいてから再度お試しください。';
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div role="status" aria-live="polite" className="quote-panel">
                <h3 className="mb-3 font-serif text-base font-bold text-ink">送信完了</h3>
                <p className="mb-5 text-[13px] leading-loose text-body">
                    お問い合わせありがとうございます。
                    <br />
                    確認次第、ご連絡させていただきます。
                </p>
                <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
                    新しいお問い合わせ
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="お名前"
                placeholder="山田 太郎"
                error={errors.name?.message}
                required
                {...register('name')}
            />

            <Input
                type="email"
                label="メールアドレス"
                placeholder="example@email.com"
                error={errors.email?.message}
                required
                {...register('email')}
            />

            <TextArea
                label="お問い合わせ内容"
                placeholder="お問い合わせ内容をご記入ください..."
                rows={6}
                error={errors.message?.message}
                required
                {...register('message')}
            />

            {submitError && (
                <div role="alert" className="border-l-2 border-warn bg-panel px-4 py-3">
                    <p className="text-xs text-warn">{submitError}</p>
                </div>
            )}

            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full" size="md">
                {isSubmitting ? '送信中...' : '上記内容で送信する'}
            </Button>
        </form>
    );
}
