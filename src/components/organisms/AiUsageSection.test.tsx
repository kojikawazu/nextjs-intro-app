import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AiUsageSection } from './AiUsageSection';
import type { AiPractice, AiUsageData } from '@/types/portfolio';

/**
 * 方針 1 件分のテストデータを作る。
 *
 * @param title - 方針の見出し
 * @returns `AiPractice` 1 件
 */
function practice(title: string): AiPractice {
    return { ai_practice_title: title, ai_practice_contents: `${title}の要約` };
}

/**
 * 既定値を埋めた `AiUsageData` を作る。各テストで検証したいフィールドだけを上書きする。
 *
 * @param overrides - 上書きしたいフィールド
 * @returns `AiUsageData`
 */
function usageData(overrides: Partial<AiUsageData> = {}): AiUsageData {
    return {
        ai_usage_description: '判断は人間が行う。',
        ai_practices: [practice('土台をつくる'), practice('AIに任せないこと')],
        ai_usage_detail_url: 'https://example.com/ai-usage',
        ...overrides,
    };
}

describe('AiUsageSection', () => {
    // --- 正常系 ---
    it('見出し・原則・各方針・詳細リンクを表示する', () => {
        render(<AiUsageSection title="AI" data={usageData()} />);

        expect(screen.getByRole('heading', { level: 2, name: 'AI' })).toBeInTheDocument();
        expect(screen.getByText('判断は人間が行う。')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '土台をつくる' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'AIに任せないこと' })).toBeInTheDocument();

        const link = screen.getByRole('link', { name: 'AIの詳細を新しいタブで開く' });
        expect(link).toHaveAttribute('href', 'https://example.com/ai-usage');
        expect(link).toHaveAttribute('target', '_blank');
        // rel は 2 語そろって初めて意味を持つため、片方だけの退行を拾えるよう個別に確認する。
        expect(link.getAttribute('rel')).toContain('noopener');
        expect(link.getAttribute('rel')).toContain('noreferrer');
    });

    // --- 準正常系 ---
    it('見出しに件数を出さない', () => {
        render(<AiUsageSection title="AI" data={usageData()} />);

        // 方針は 2 件だが、件数表示を持たないセクションとして扱う。
        expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    it('詳細 URL が空ならリンクを描画しない', () => {
        // <a href=""> は現在のページ自身を指し、押すと再読み込みされるだけになる。
        // href が空の <a> は link ロールを持たないため、ロールではなく要素で確かめる
        // （ロールで検査するとガードを外しても 0 件のまま通ってしまう）。
        const { container } = render(
            <AiUsageSection title="AI" data={usageData({ ai_usage_detail_url: '' })} />,
        );

        expect(container.querySelectorAll('a')).toHaveLength(0);
    });

    it('方針が 0 件でも見出し・原則・詳細リンクは出す', () => {
        render(<AiUsageSection title="AI" data={usageData({ ai_practices: [] })} />);

        expect(screen.getByRole('heading', { level: 2, name: 'AI' })).toBeInTheDocument();
        expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
        expect(
            screen.getByRole('link', { name: 'AIの詳細を新しいタブで開く' }),
        ).toBeInTheDocument();
    });

    // --- 異常系 ---
    it('空白のみの詳細 URL は未設定として扱う', () => {
        const { container } = render(
            <AiUsageSection title="AI" data={usageData({ ai_usage_detail_url: '   ' })} />,
        );

        expect(container.querySelectorAll('a')).toHaveLength(0);
    });

    it('配列の順をそのまま表示順にする', () => {
        render(
            <AiUsageSection
                title="AI"
                data={usageData({ ai_practices: [practice('先'), practice('後')] })}
            />,
        );

        const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
        expect(titles).toEqual(['先', '後']);
    });
});
