import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutSection, type AboutSectionProps } from './AboutSection';

/**
 * 既定値を埋めた `AboutSection` を描画する。
 *
 * @param overrides - 上書きしたい props
 * @returns Testing Library の描画結果
 */
function renderSection(overrides: Partial<AboutSectionProps> = {}) {
    const props: AboutSectionProps = {
        title: 'About',
        name: '山田 太郎',
        imageUrl: 'https://example.com/profile.png',
        snsList: [
            { sns_name: 'github', sns_url: 'https://github.com/', sns_img: '' },
            { sns_name: 'zenn', sns_url: 'https://zenn.dev/', sns_img: '' },
        ],
        paragraphs: ['一段落目', '二段落目'],
        ...overrides,
    };

    return render(<AboutSection {...props} />);
}

describe('AboutSection', () => {
    // --- 正常系 ---
    it('見出し・段落・SNS リンクを表示する', () => {
        renderSection();

        expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
        expect(screen.getByText('一段落目')).toBeInTheDocument();
        expect(screen.getByText('二段落目')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'githubのプロフィールを開く' }),
        ).toBeInTheDocument();
    });

    it('氏名は画像の代替テキストとしてのみ使う', () => {
        // 写真の直下に名前を再掲しない方針（issue #138）。alt には残す。
        renderSection();

        expect(screen.getByAltText('山田 太郎')).toBeInTheDocument();
        expect(screen.queryByText('山田 太郎')).not.toBeInTheDocument();
    });

    // --- 準正常系 ---
    it('段落が 0 件でも見出しと画像は残る', () => {
        // Hero へ引き上げた結果、About に残る段落が無くなる状態もありうる。
        renderSection({ paragraphs: [] });

        expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
        expect(screen.getByAltText('山田 太郎')).toBeInTheDocument();
    });

    it('SNS が 0 件でもリンク以外は残る', () => {
        renderSection({ snsList: [] });

        expect(screen.queryAllByRole('link')).toHaveLength(0);
        expect(screen.getByText('一段落目')).toBeInTheDocument();
    });

    // --- 異常系 ---
    it('件数は表示しない', () => {
        // 段落数を出しても読み手の判断材料にならないため、SectionHeading に count を渡さない。
        renderSection({ paragraphs: ['一', '二', '三'] });

        expect(screen.queryByText('3')).not.toBeInTheDocument();
    });
});
