import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AiPracticeEntry } from './AiPracticeEntry';

describe('AiPracticeEntry', () => {
    // --- 正常系 ---
    it('方針の見出しと要約を表示する', () => {
        render(<AiPracticeEntry title="土台をつくる" description="規約を明文化している。" />);

        expect(screen.getByRole('heading', { level: 3, name: '土台をつくる' })).toBeInTheDocument();
        expect(screen.getByText('規約を明文化している。')).toBeInTheDocument();
    });

    // --- 準正常系（想定内の欠損）---
    it('要約が空なら段落を描画せず、見出しだけを残す', () => {
        const { container } = render(<AiPracticeEntry title="土台をつくる" description="" />);

        expect(screen.getByRole('heading', { name: '土台をつくる' })).toBeInTheDocument();
        expect(container.querySelectorAll('p')).toHaveLength(0);
    });

    // --- 異常系（想定外の入力）---
    it('空白のみの要約は未設定として扱う', () => {
        // GCS の JSON は手書きのため、消したつもりのフィールドに空白が残りうる。
        const { container } = render(<AiPracticeEntry title="土台をつくる" description={' \t'} />);

        expect(container.querySelectorAll('p')).toHaveLength(0);
    });

    it('呼び出し側のクラスを既定のクラスと併せて適用する', () => {
        const { container } = render(
            <AiPracticeEntry title="見出し" description="要約" className="mt-2" />,
        );

        const article = container.querySelector('article');
        expect(article).toHaveClass('mt-2');
        // 上書きではなく併用であること（区切り罫が消えていない）を確かめる。
        expect(article).toHaveClass('border-b');
    });
});
