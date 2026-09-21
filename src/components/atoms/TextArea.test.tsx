import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextArea } from './TextArea';

// TextArea は Input と同じ方針（label 関連付け・aria-describedby / aria-invalid・forwardRef）を
// textarea 版として実装している。同じ契約を持つ以上、片方だけ壊れることを検出できるよう
// 両方に同等のテストを置く（共通化すると「どちらのコンポーネントが落ちたか」が読みにくくなる）。

describe('TextArea', () => {
    // --- 正常系 ---
    it('ラベルから入力欄を特定でき、入力した値が反映される', async () => {
        render(<TextArea label="お問い合わせ内容" />);

        const textArea = screen.getByLabelText('お問い合わせ内容');
        await userEvent.type(textArea, 'ご相談したいことがあります');

        expect(textArea).toHaveValue('ご相談したいことがあります');
    });

    // --- 準正常系（エラー・補助説明の出し分け）---
    it('エラーがあれば aria-invalid を立て、エラー文を読み上げ対象に結び付ける', () => {
        render(<TextArea label="お問い合わせ内容" error="お問い合わせ内容は必須です" />);

        const textArea = screen.getByLabelText('お問い合わせ内容');
        expect(textArea).toHaveAttribute('aria-invalid', 'true');
        expect(textArea).toHaveAccessibleDescription('お問い合わせ内容は必須です');
    });

    it('補助説明があれば読み上げ対象に結び付ける', () => {
        render(<TextArea label="お問い合わせ内容" hint="10 文字以上でご記入ください" />);

        const textArea = screen.getByLabelText('お問い合わせ内容');
        expect(textArea).toHaveAccessibleDescription('10 文字以上でご記入ください');
        expect(textArea).not.toHaveAttribute('aria-invalid');
    });

    it('エラーと補助説明が同時に来たらエラーだけを出す', () => {
        render(<TextArea label="お問い合わせ内容" hint="補助説明" error="必須です" />);

        expect(screen.getByText('必須です')).toBeInTheDocument();
        expect(screen.queryByText('補助説明')).not.toBeInTheDocument();
    });

    it('呼び出し側が指定した id を優先する', () => {
        render(<TextArea label="お問い合わせ内容" id="contact-message" />);

        expect(screen.getByLabelText('お問い合わせ内容')).toHaveAttribute('id', 'contact-message');
    });

    it('rows を指定すると行数がそのまま反映される', () => {
        render(<TextArea label="お問い合わせ内容" rows={6} />);

        expect(screen.getByLabelText('お問い合わせ内容')).toHaveAttribute('rows', '6');
    });

    it('required ならラベルに必須の印を出す', () => {
        render(<TextArea label="お問い合わせ内容" required />);

        expect(screen.getByText('*')).toBeInTheDocument();
        expect(screen.getByLabelText(/お問い合わせ内容/)).toBeRequired();
    });

    // --- 異常系（フォーム連携と id 衝突）---
    it('ref を内部の textarea 要素へ透過する', () => {
        const ref = createRef<HTMLTextAreaElement>();
        render(<TextArea label="お問い合わせ内容" ref={ref} />);

        expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('同じ画面に 2 つ置いても id が衝突しない', () => {
        render(
            <>
                <TextArea label="お問い合わせ内容" />
                <TextArea label="補足事項" />
            </>,
        );

        const message = screen.getByLabelText('お問い合わせ内容');
        const note = screen.getByLabelText('補足事項');
        expect(message.id).not.toBe(note.id);
        expect(message.id).not.toBe('');
    });

    it('空文字のエラーはエラー扱いにしない', () => {
        render(<TextArea label="お問い合わせ内容" error="" hint="補助説明" />);

        const textArea = screen.getByLabelText('お問い合わせ内容');
        expect(textArea).not.toHaveAttribute('aria-invalid');
        expect(textArea).toHaveAccessibleDescription('補助説明');
    });
});
