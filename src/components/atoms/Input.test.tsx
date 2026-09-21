import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
    // --- 正常系 ---
    it('ラベルから入力欄を特定でき、入力した値が反映される', async () => {
        render(<Input label="お名前" />);

        // getByLabelText で引けること自体が htmlFor / id の関連付けの証明になる。
        // ラベルを「描画している」ことと「関連付けている」ことは別（issue #83）。
        const input = screen.getByLabelText('お名前');
        await userEvent.type(input, '山田 太郎');

        expect(input).toHaveValue('山田 太郎');
    });

    // --- 準正常系（エラー・補助説明の出し分け）---
    it('エラーがあれば aria-invalid を立て、エラー文を読み上げ対象に結び付ける', () => {
        render(<Input label="お名前" error="お名前は必須です" />);

        const input = screen.getByLabelText('お名前');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAccessibleDescription('お名前は必須です');
    });

    it('補助説明があれば読み上げ対象に結び付ける', () => {
        render(<Input label="お名前" hint="姓と名の間に空白を入れてください" />);

        const input = screen.getByLabelText('お名前');
        expect(input).toHaveAccessibleDescription('姓と名の間に空白を入れてください');
        expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('エラーと補助説明が同時に来たらエラーだけを出す', () => {
        render(<Input label="お名前" hint="補助説明" error="お名前は必須です" />);

        expect(screen.getByText('お名前は必須です')).toBeInTheDocument();
        expect(screen.queryByText('補助説明')).not.toBeInTheDocument();
        // describedby が両方を指すと、エラー解消前の説明まで読み上げられてしまう。
        expect(screen.getByLabelText('お名前')).toHaveAccessibleDescription('お名前は必須です');
    });

    it('呼び出し側が指定した id を優先する', () => {
        render(<Input label="お名前" id="contact-name" />);

        expect(screen.getByLabelText('お名前')).toHaveAttribute('id', 'contact-name');
    });

    it('label 未指定ならラベルを描画しない', () => {
        render(<Input placeholder="検索" />);

        expect(screen.getByPlaceholderText('検索')).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: /.+/ })).not.toBeInTheDocument();
    });

    it('required ならラベルに必須の印を出す', () => {
        render(<Input label="お名前" required />);

        expect(screen.getByText('*')).toBeInTheDocument();
        expect(screen.getByLabelText(/お名前/)).toBeRequired();
    });

    // --- 異常系（フォーム連携と id 衝突）---
    it('ref を内部の input 要素へ透過する', () => {
        // react-hook-form の register() が返す ref を DOM まで届ける経路。
        const ref = createRef<HTMLInputElement>();
        render(<Input label="お名前" ref={ref} />);

        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('同じ画面に 2 つ置いても id が衝突しない', () => {
        // id を固定値にすると label の関連付けが片方に吸われる。useId による生成を固定する。
        render(
            <>
                <Input label="お名前" />
                <Input label="会社名" />
            </>,
        );

        const name = screen.getByLabelText('お名前');
        const company = screen.getByLabelText('会社名');
        expect(name.id).not.toBe(company.id);
        expect(name.id).not.toBe('');
    });

    it('空文字のエラーはエラー扱いにしない', () => {
        render(<Input label="お名前" error="" hint="補助説明" />);

        // error='' で aria-invalid が立つと、正常な入力欄が壊れているように読み上げられる。
        const input = screen.getByLabelText('お名前');
        expect(input).not.toHaveAttribute('aria-invalid');
        expect(input).toHaveAccessibleDescription('補助説明');
    });
});
