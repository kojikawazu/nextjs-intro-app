import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleEntry, type ArticleEntryProps } from './ArticleEntry';

/**
 * 既定値を埋めた `ArticleEntry` を描画する。
 *
 * 検証の中心は「欠損したフィールドをどう落とすか」のため、既定はすべて埋めた状態にし、
 * 各テストで空にしたいものだけを上書きする。
 *
 * @param overrides - 上書きしたい props
 * @returns Testing Library の描画結果
 */
function renderEntry(overrides: Partial<ArticleEntryProps> = {}) {
    const props: ArticleEntryProps = {
        title: 'テスト記事のタイトル',
        url: 'https://zenn.dev/example/articles/test',
        platform: 'Zenn',
        publishedAt: '2024年5月',
        description: '記事の概要文',
        ...overrides,
    };

    return render(<ArticleEntry {...props} />);
}

describe('ArticleEntry', () => {
    // --- 正常系 ---
    it('タイトル・媒体・公開年月・概要を表示し、タイトルをリンクにする', () => {
        renderEntry();

        // タイトル自体が行き先を説明するため、アクセシブル名は可視テキストのまま使う
        // （aria-label で上書きしない）。
        expect(screen.getByRole('link', { name: 'テスト記事のタイトル' })).toBeInTheDocument();
        expect(screen.getByText('Zenn ・ 2024年5月')).toBeInTheDocument();
        expect(screen.getByText('記事の概要文')).toBeInTheDocument();
    });

    it('外部リンクを別タブで開き、遷移先から操作されないようにする', () => {
        renderEntry();

        const link = screen.getByRole('link', { name: 'テスト記事のタイトル' });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('href', 'https://zenn.dev/example/articles/test');
        // rel は 2 語そろって初めて意味を持つため、片方だけの退行を拾えるよう個別に確認する。
        expect(link.getAttribute('rel')).toContain('noopener');
        expect(link.getAttribute('rel')).toContain('noreferrer');
    });

    // --- 準正常系（想定内の欠損）---
    it('媒体が空なら中黒を出さず、公開年月だけを表示する', () => {
        renderEntry({ platform: '' });

        expect(screen.getByText('2024年5月')).toBeInTheDocument();
        expect(screen.queryByText(/・/)).not.toBeInTheDocument();
    });

    it('公開年月が空なら中黒を出さず、媒体だけを表示する', () => {
        renderEntry({ publishedAt: '' });

        expect(screen.getByText('Zenn')).toBeInTheDocument();
        expect(screen.queryByText(/・/)).not.toBeInTheDocument();
    });

    it('媒体と公開年月がどちらも空ならメタ行ごと描画しない', () => {
        renderEntry({ platform: '', publishedAt: '' });

        // タイトルと概要は残る。消えるのはメタ行だけ。
        expect(screen.getByRole('link', { name: 'テスト記事のタイトル' })).toBeInTheDocument();
        expect(screen.queryByText(/・/)).not.toBeInTheDocument();
    });

    it('概要が空なら概要の段落を描画しない', () => {
        renderEntry({ description: '' });

        expect(screen.queryByText('記事の概要文')).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'テスト記事のタイトル' })).toBeInTheDocument();
    });

    it('URL が空ならリンクにせず、タイトルは見出しとして残す', () => {
        // <a href=""> は現在のページ自身を指す。押すとページが再読み込みされるため、
        // 「押せるのに何も起きない」リンクを作らない。
        const { container } = renderEntry({ url: '' });

        // **ロールではなく要素で確認する。** `<a href="">` はアクセシビリティツリー上で
        // link ロールを持たない（href が空のため）。`queryAllByRole('link')` で検査すると
        // ガードを外しても 0 件のままで通ってしまい、テストが何も守らなくなる
        // （変異注入で実際に素通りすることを確認済み）。
        expect(container.querySelectorAll('a')).toHaveLength(0);
        expect(screen.getByRole('heading', { name: 'テスト記事のタイトル' })).toBeInTheDocument();
    });

    // --- 異常系（想定外の入力）---
    it('空白のみの値は未設定として扱う', () => {
        // GCS の JSON は手書きのため、消したつもりのフィールドに空白が残りうる。
        renderEntry({ url: '   ', platform: ' ', publishedAt: '\t' });

        expect(screen.queryAllByRole('link')).toHaveLength(0);
        expect(screen.queryByText(/・/)).not.toBeInTheDocument();
    });
});
