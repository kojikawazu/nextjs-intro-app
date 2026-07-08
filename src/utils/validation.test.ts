import { describe, it, expect } from 'vitest';
import { ContactFormSchema } from './validation';

const validInput = {
    name: '山田太郎',
    email: 'test@example.com',
    message: 'お問い合わせ内容のテストメッセージです。',
};

// 指定フィールドの最初のバリデーションエラーメッセージを返す（成功時は undefined）。
function firstError(input: unknown, field: 'name' | 'email' | 'message'): string | undefined {
    const result = ContactFormSchema.safeParse(input);
    if (result.success) return undefined;
    return result.error.flatten().fieldErrors[field]?.[0];
}

describe('ContactFormSchema', () => {
    // --- 正常系 ---
    it('全項目が妥当な値のときバリデーションに成功する', () => {
        expect(ContactFormSchema.safeParse(validInput).success).toBe(true);
    });

    describe('name', () => {
        // 正常系（境界値）
        it('2文字（下限境界）を受け入れる', () => {
            expect(ContactFormSchema.safeParse({ ...validInput, name: '太郎' }).success).toBe(true);
        });

        it('50文字（上限境界）を受け入れる', () => {
            expect(
                ContactFormSchema.safeParse({ ...validInput, name: 'あ'.repeat(50) }).success,
            ).toBe(true);
        });

        // 異常系
        it('空文字は「必須」エラーになる', () => {
            expect(firstError({ ...validInput, name: '' }, 'name')).toBe('お名前は必須です');
        });

        it('1文字は「2文字以上」エラーになる', () => {
            expect(firstError({ ...validInput, name: 'あ' }, 'name')).toBe(
                'お名前は2文字以上で入力してください',
            );
        });

        it('51文字は「50文字以内」エラーになる', () => {
            expect(firstError({ ...validInput, name: 'あ'.repeat(51) }, 'name')).toBe(
                'お名前は50文字以内で入力してください',
            );
        });
    });

    describe('email', () => {
        // 正常系（境界値）
        it('255文字（上限境界）の妥当なメールを受け入れる', () => {
            const email = 'a'.repeat(243) + '@example.com'; // 243 + 12 = 255
            expect(email.length).toBe(255);
            expect(ContactFormSchema.safeParse({ ...validInput, email }).success).toBe(true);
        });

        // 異常系
        it('空文字は「必須」エラーになる', () => {
            expect(firstError({ ...validInput, email: '' }, 'email')).toBe(
                'メールアドレスは必須です',
            );
        });

        it('@ を含まない文字列は形式エラーになる', () => {
            expect(firstError({ ...validInput, email: 'testexample.com' }, 'email')).toBe(
                '正しいメールアドレスを入力してください',
            );
        });

        it('ドメイン部が無いメールは形式エラーになる', () => {
            expect(firstError({ ...validInput, email: 'test@' }, 'email')).toBe(
                '正しいメールアドレスを入力してください',
            );
        });

        it('256文字は「255文字以内」エラーになる', () => {
            const email = 'a'.repeat(244) + '@example.com'; // 256
            expect(email.length).toBe(256);
            expect(firstError({ ...validInput, email }, 'email')).toBe(
                'メールアドレスは255文字以内で入力してください',
            );
        });
    });

    describe('message', () => {
        // 正常系（境界値）
        it('10文字（下限境界）を受け入れる', () => {
            expect(
                ContactFormSchema.safeParse({ ...validInput, message: 'あ'.repeat(10) }).success,
            ).toBe(true);
        });

        it('2000文字（上限境界）を受け入れる', () => {
            expect(
                ContactFormSchema.safeParse({ ...validInput, message: 'あ'.repeat(2000) }).success,
            ).toBe(true);
        });

        // 異常系
        it('空文字は「必須」エラーになる', () => {
            expect(firstError({ ...validInput, message: '' }, 'message')).toBe(
                'お問い合わせ内容は必須です',
            );
        });

        it('9文字は「10文字以上」エラーになる', () => {
            expect(firstError({ ...validInput, message: 'あ'.repeat(9) }, 'message')).toBe(
                'お問い合わせ内容は10文字以上で入力してください',
            );
        });

        it('2001文字は「2000文字以内」エラーになる', () => {
            expect(firstError({ ...validInput, message: 'あ'.repeat(2001) }, 'message')).toBe(
                'お問い合わせ内容は2000文字以内で入力してください',
            );
        });
    });

    // --- 異常系（構造）---
    it('フィールドが欠落したオブジェクトはエラーになる', () => {
        expect(ContactFormSchema.safeParse({}).success).toBe(false);
    });
});
