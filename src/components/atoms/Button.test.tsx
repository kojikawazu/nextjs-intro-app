import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
    // --- 正常系 ---
    it('ラベルを表示し、押すとハンドラが呼ばれる', async () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>送信する</Button>);

        await userEvent.click(screen.getByRole('button', { name: '送信する' }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    // --- 準正常系（処理待ち・無効化）---
    it('処理待ちの間は押せない（二重送信を防ぐ）', async () => {
        const onClick = vi.fn();
        render(
            <Button isLoading onClick={onClick}>
                送信中...
            </Button>,
        );

        const button = screen.getByRole('button', { name: '送信中...' });
        expect(button).toBeDisabled();

        await userEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('処理待ちでもラベルは残す（何のボタンか分からなくならない）', () => {
        render(<Button isLoading>送信する</Button>);

        expect(screen.getByRole('button', { name: '送信する' })).toBeInTheDocument();
    });

    it('disabled を渡すと押せない', async () => {
        const onClick = vi.fn();
        render(
            <Button disabled onClick={onClick}>
                送信する
            </Button>,
        );

        await userEvent.click(screen.getByRole('button'));

        expect(onClick).not.toHaveBeenCalled();
    });

    it('isLoading も disabled も無ければ押せる', async () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>送信する</Button>);

        await userEvent.click(screen.getByRole('button'));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button')).toBeEnabled();
    });

    it('variant と size で見た目が切り替わる', () => {
        const { rerender } = render(<Button>送信する</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-acc', 'h-10');

        rerender(
            <Button variant="outline" size="sm">
                送信する
            </Button>,
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass('border', 'h-8');
        expect(button).not.toHaveClass('bg-acc');
    });

    // --- 異常系（フォーム連携とアクセシビリティの契約）---
    it('ref を内部の button 要素へ透過する', () => {
        // react-hook-form の register() が返す ref がここで止まるとフォーム制御が効かない。
        // issue #131 で一度壊した経路のため仕様として固定する。
        const ref = createRef<HTMLButtonElement>();
        render(<Button ref={ref}>送信する</Button>);

        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
        expect(ref.current?.textContent).toBe('送信する');
    });

    it('スピナーは読み上げ対象から外す', () => {
        const { container } = render(<Button isLoading>送信する</Button>);

        // 装飾の svg が読み上げられると「グラフィック」等と発話され、意味を成さない。
        const spinner = container.querySelector('svg');
        expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('type を指定しなければフォーム内で submit として働く', () => {
        // ネイティブの既定に委ねている。明示的に type="button" を付けると
        // ContactForm の送信ボタンが動かなくなるため、既定を変えていないことを固定する。
        render(<Button>送信する</Button>);

        expect(screen.getByRole('button')).not.toHaveAttribute('type');
    });
});
