import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductSection } from './ProductSection';
import type { ProductItem } from '@/types/portfolio';

/**
 * プロダクト 1 件分のテストデータを作る。
 *
 * @param overrides - 上書きしたいフィールド
 * @returns `ProductItem` 1 件
 */
function product(overrides: Partial<ProductItem> = {}): ProductItem {
    return {
        product_title: 'テストプロダクト',
        product_contents: '概要',
        product_site_url: 'https://example.com/',
        product_repo_url: 'https://github.com/example/repo',
        product_skill_stack: [],
        ...overrides,
    };
}

describe('ProductSection', () => {
    // --- 正常系 ---
    it('見出し・件数・説明文・各プロダクトを表示する', () => {
        render(
            <ProductSection
                title="Product"
                data={{
                    product_description: '個人開発したもの',
                    product_items: [
                        product({ product_title: 'プロダクトA' }),
                        product({ product_title: 'プロダクトB' }),
                    ],
                }}
            />,
        );

        expect(screen.getByRole('heading', { name: 'Product' })).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('個人開発したもの')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'プロダクトA' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'プロダクトB' })).toBeInTheDocument();
    });

    // --- 準正常系 ---
    it('掲載が 0 件でも見出しと件数 0 を出す', () => {
        render(
            <ProductSection
                title="Product"
                data={{ product_description: '説明', product_items: [] }}
            />,
        );

        expect(screen.getByRole('heading', { name: 'Product' })).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    });

    it('説明文が空でも見出しと一覧は残る', () => {
        // 説明文は GCS 由来のため空になりうる。一覧まで消える理由はない。
        render(
            <ProductSection
                title="Product"
                data={{ product_description: '', product_items: [product()] }}
            />,
        );

        expect(screen.getByRole('heading', { name: 'テストプロダクト' })).toBeInTheDocument();
    });

    // --- 異常系 ---
    it('配列の順をそのまま表示順にする', () => {
        render(
            <ProductSection
                title="Product"
                data={{
                    product_description: '説明',
                    product_items: [
                        product({ product_title: '先に置いたもの' }),
                        product({ product_title: '後に置いたもの' }),
                    ],
                }}
            />,
        );

        const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
        expect(titles).toEqual(['先に置いたもの', '後に置いたもの']);
    });
});
