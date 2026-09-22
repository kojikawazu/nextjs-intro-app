import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticlesSection } from './ArticlesSection';
import type { ArticleItem } from '@/types/portfolio';

/**
 * 記事 1 件分のテストデータを作る。
 *
 * @param overrides - 上書きしたいフィールド
 * @returns `ArticleItem` 1 件
 */
function article(overrides: Partial<ArticleItem> = {}): ArticleItem {
    return {
        article_title: 'テスト記事',
        article_url: 'https://zenn.dev/example',
        article_platform: 'Zenn',
        article_published_at: '2024年5月',
        article_contents: '概要',
        ...overrides,
    };
}

describe('ArticlesSection', () => {
    // --- 正常系 ---
    it('見出し・件数・説明文・各記事を表示する', () => {
        render(
            <ArticlesSection
                title="Articles"
                data={{
                    article_description: '反響のあった記事',
                    article_items: [
                        article({ article_title: '記事A' }),
                        article({ article_title: '記事B' }),
                    ],
                }}
            />,
        );

        expect(screen.getByRole('heading', { name: 'Articles' })).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('反響のあった記事')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '記事A' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '記事B' })).toBeInTheDocument();
    });

    // --- 準正常系 ---
    it('掲載が 0 件でも見出しと件数 0 を出す', () => {
        render(
            <ArticlesSection
                title="Articles"
                data={{ article_description: '説明', article_items: [] }}
            />,
        );

        expect(screen.getByRole('heading', { name: 'Articles' })).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('URL が空の記事はリンクにせず、他の記事のリンクは残す', () => {
        render(
            <ArticlesSection
                title="Articles"
                data={{
                    article_description: '説明',
                    article_items: [
                        article({ article_title: 'リンク無し', article_url: '' }),
                        article({ article_title: 'リンク有り' }),
                    ],
                }}
            />,
        );

        expect(screen.queryAllByRole('link')).toHaveLength(1);
        expect(screen.getByRole('heading', { name: 'リンク無し' })).toBeInTheDocument();
    });

    // --- 異常系 ---
    it('配列の順をそのまま表示順にする', () => {
        render(
            <ArticlesSection
                title="Articles"
                data={{
                    article_description: '説明',
                    article_items: [
                        article({ article_title: '先に置いたもの' }),
                        article({ article_title: '後に置いたもの' }),
                    ],
                }}
            />,
        );

        const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
        expect(titles).toEqual(['先に置いたもの', '後に置いたもの']);
    });
});
