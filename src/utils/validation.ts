import { z } from 'zod';

export const ContactFormSchema = z.object({
    name: z
        .string()
        .min(1, 'お名前は必須です')
        .min(2, 'お名前は2文字以上で入力してください')
        .max(50, 'お名前は50文字以内で入力してください'),

    email: z
        .string()
        .min(1, 'メールアドレスは必須です')
        .email('正しいメールアドレスを入力してください')
        .max(255, 'メールアドレスは255文字以内で入力してください'),

    message: z
        .string()
        .min(1, 'お問い合わせ内容は必須です')
        .min(10, 'お問い合わせ内容は10文字以上で入力してください')
        .max(2000, 'お問い合わせ内容は2000文字以内で入力してください'),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;
