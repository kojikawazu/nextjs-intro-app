import { z } from 'zod';

/**
 * お問い合わせフォーム入力の検証スキーマ。
 *
 * このスキーマを**単一の真実**とし、型は `ContactFormInput` として `z.infer` で導出する
 * （`coding-standards.md`「スキーマを単一の真実とし、型は z.infer で導出する」）。
 *
 * 各フィールドで `min(1)` と `min(2)` のように下限を二重に指定しているのは、
 * 「未入力」と「文字数不足」でエラーメッセージを出し分けるため。Zod は失敗した制約を
 * **すべて定義順に**返す（空文字なら `必須です` と `2文字以上です` の 2 件）ので、
 * `min(1)` を先に置くという順序自体が意味を持つ。`zodResolver` は既定の
 * `criteriaMode: 'firstError'` で各フィールドの先頭 issue だけを `errors.<field>.message`
 * に載せるため、結果として空欄時には必須エラーが表示される。
 *
 * **本スキーマはクライアント側の検証にしか使われていない。** `frontend.md` は「クライアント検証は
 * UX のためのものでありセキュリティ担保ではない。Route Handler でも必ず検証する」と定めるが、
 * 現状 `src/app/api/contact/route.ts` は `!name || !email || !message` の必須チェックのみで、
 * 本スキーマを参照していない（文字数上限はサーバー側で未検証）。統一は docs/11 タスク #49 として未着手。
 */
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

/**
 * 検証を通過したお問い合わせフォームの入力値。
 *
 * `ContactFormSchema` から導出するため、スキーマを変更すれば型も自動的に追随する。
 * 同じ形を手書きで二重定義しないこと。
 */
export type ContactFormInput = z.infer<typeof ContactFormSchema>;
