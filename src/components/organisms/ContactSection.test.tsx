import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactSection } from './ContactSection';

describe('ContactSection', () => {
    // --- 正常系 ---
    it('見出し・説明文・フォームを表示する', () => {
        render(<ContactSection title="Contact" />);

        expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
        expect(screen.getByText('お気軽にお問い合わせください')).toBeInTheDocument();
        // 配線の確認。ContactForm 自体の仕様は §4.7.9 が担う。
        expect(screen.getByRole('button', { name: /送信/ })).toBeInTheDocument();
    });

    // --- 準正常系 ---
    it('見出しが空でもフォームは描画する', () => {
        // 見出しは navbar_data 由来のため空になりうる。問い合わせ手段まで失わせない。
        render(<ContactSection title="" />);

        expect(screen.getByRole('button', { name: /送信/ })).toBeInTheDocument();
    });

    it('件数は表示しない', () => {
        // 件数の概念が無いセクションのため、SectionHeading に count を渡さない。
        const { container } = render(<ContactSection title="Contact" />);

        const heading = container.querySelector('.section-heading');
        expect(heading?.querySelectorAll('span')).toHaveLength(0);
    });
});
