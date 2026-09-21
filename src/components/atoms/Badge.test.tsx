import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
    // --- 正常系 ---
    it('渡した内容を表示する', () => {
        render(<Badge>現在</Badge>);

        expect(screen.getByText('現在')).toBeInTheDocument();
    });

    // --- 準正常系（バリエーションと属性の受け渡し）---
    it('既定はアクセント色で塗る', () => {
        render(<Badge>現在</Badge>);

        // variant はクラスとしてしか観測できないため、ここだけはクラスを検証する。
        // 「既定値を変えたら気づく」ことが目的で、配色そのものはトークン側の責務。
        expect(screen.getByText('現在')).toHaveClass('bg-acc', 'text-acc-on');
    });

    it('outline を指定すると枠線のみになる', () => {
        render(<Badge variant="outline">補足</Badge>);

        const badge = screen.getByText('補足');
        expect(badge).toHaveClass('border', 'text-mute');
        expect(badge).not.toHaveClass('bg-acc');
    });

    it('className を渡しても既定のクラスが消えない', () => {
        render(<Badge className="ml-4">現在</Badge>);

        // cn()（clsx + tailwind-merge）による結合。上書きではなく追加であることを固定する。
        const badge = screen.getByText('現在');
        expect(badge).toHaveClass('ml-4');
        expect(badge).toHaveClass('bg-acc');
    });

    it('ネイティブの span 属性をそのまま透過する', () => {
        render(<Badge data-testid="badge-native">現在</Badge>);

        expect(screen.getByTestId('badge-native')).toBeInTheDocument();
    });

    // --- 異常系 ---
    it('見出し行に挟めるよう span で描画する（ブロック要素にしない）', () => {
        // <div> にすると h3 の行内に置けず、タイトル横の「現在」が改行されてしまう。
        render(<Badge>現在</Badge>);

        expect(screen.getByText('現在').tagName).toBe('SPAN');
    });

    it('内容が空でも落ちずに描画する', () => {
        const { container } = render(<Badge data-testid="empty-badge">{''}</Badge>);

        expect(screen.getByTestId('empty-badge')).toBeEmptyDOMElement();
        expect(container.querySelectorAll('span')).toHaveLength(1);
    });
});
