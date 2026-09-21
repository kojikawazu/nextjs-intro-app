import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard, type ProductCardProps } from './ProductCard';

/**
 * 既定値を埋めた `ProductCard` を描画する。
 *
 * URL の出し分けが検証の中心のため、既定では**両方の URL が埋まった状態**にし、
 * 各テストで空にしたい方だけを上書きする。
 *
 * @param overrides - 上書きしたい props
 * @returns Testing Library の描画結果
 */
function renderCard(overrides: Partial<ProductCardProps> = {}) {
    const props: ProductCardProps = {
        title: 'テストプロダクト',
        description: 'プロダクトの説明文',
        siteUrl: 'https://example.com/',
        repoUrl: 'https://github.com/example/repo',
        techStack: [],
        ...overrides,
    };

    return render(<ProductCard {...props} />);
}

describe('ProductCard', () => {
    // --- 正常系 ---
    it('タイトル・概要・技術スタック・両方のリンクを表示する', () => {
        renderCard({ techStack: ['Next.js', 'TypeScript'] });

        expect(screen.getByRole('heading', { name: 'テストプロダクト' })).toBeInTheDocument();
        expect(screen.getByText('プロダクトの説明文')).toBeInTheDocument();
        expect(screen.getByText('Next.js')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'テストプロダクトのサイトを開く' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'テストプロダクトのリポジトリを開く' }),
        ).toBeInTheDocument();
    });

    it('外部リンクを別タブで開き、遷移先から操作されないようにする', () => {
        renderCard();

        // rel は 2 語そろって初めて意味を持つ（`noopener` が window.opener を切り、
        // `noreferrer` が Referer を落とす）。片方だけの退行を拾うため個別に確認する。
        for (const name of [
            'テストプロダクトのサイトを開く',
            'テストプロダクトのリポジトリを開く',
        ]) {
            const link = screen.getByRole('link', { name });
            expect(link).toHaveAttribute('target', '_blank');
            expect(link.getAttribute('rel')).toContain('noopener');
            expect(link.getAttribute('rel')).toContain('noreferrer');
        }
    });

    // --- 準正常系（想定内の欠損による出し分け）---
    it('サイト URL が空なら site リンクを描画しない', () => {
        renderCard({ siteUrl: '' });

        expect(
            screen.queryByRole('link', { name: 'テストプロダクトのサイトを開く' }),
        ).not.toBeInTheDocument();
        // 片方が欠けても、もう片方は残る。
        expect(
            screen.getByRole('link', { name: 'テストプロダクトのリポジトリを開く' }),
        ).toBeInTheDocument();
    });

    it('リポジトリ URL が空なら repo リンクを描画しない', () => {
        renderCard({ repoUrl: '' });

        expect(
            screen.queryByRole('link', { name: 'テストプロダクトのリポジトリを開く' }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'テストプロダクトのサイトを開く' }),
        ).toBeInTheDocument();
    });

    it('両方の URL が空ならリンクを 1 つも描画しない', () => {
        renderCard({ siteUrl: '', repoUrl: '' });

        expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('技術スタックが空なら見出しごと描画しない', () => {
        renderCard({ techStack: [] });

        expect(screen.queryByRole('heading', { name: '技術スタック' })).not.toBeInTheDocument();
    });

    // --- 異常系（想定外の入力）---
    it('空白のみの URL は未設定として扱う', () => {
        // GCS の JSON は手書きのため、消したつもりのフィールドに空白が残りうる。
        // 空白を URL として扱うと、押しても何も起きないリンクが画面に出る。
        renderCard({ siteUrl: '   ', repoUrl: '\t\n' });

        expect(screen.queryAllByRole('link')).toHaveLength(0);
    });
});
