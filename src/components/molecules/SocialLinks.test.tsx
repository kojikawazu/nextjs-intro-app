import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialLinks } from './SocialLinks';
import type { SNSItem } from '@/types/portfolio';

/**
 * SNS リンク 1 件分のテストデータを組み立てる。
 *
 * `sns_img` は画面から参照されないが、GCS のデータには必ず含まれるため既定値で埋める。
 * 「渡されても使わない」ことをテストで確認する対象でもある。
 *
 * @param overrides - 上書きしたいフィールド
 * @returns SNS リンク 1 件
 */
function snsOf(overrides: Partial<SNSItem> = {}): SNSItem {
    return {
        sns_name: 'github',
        sns_url: 'https://github.com/example',
        sns_img: 'https://example.com/github_original_white.svg',
        ...overrides,
    };
}

describe('SocialLinks', () => {
    // --- 正常系 ---
    it('SNS 名をリンクとして表示し、URL を設定する', () => {
        render(<SocialLinks links={[snsOf()]} />);

        const link = screen.getByRole('link', { name: 'githubのプロフィールを開く' });
        expect(link).toHaveAttribute('href', 'https://github.com/example');
        expect(link).toHaveTextContent('github');
    });

    // --- 準正常系（リンクの属性と件数のバリエーション）---
    it('別タブで開き、遷移先から操作されないようにする', () => {
        render(<SocialLinks links={[snsOf()]} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('target', '_blank');
        // noopener が無いと遷移先から window.opener 経由で元タブを操作できてしまう。
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('リンク文字だけでは行き先が伝わらないため aria-label を補う', () => {
        render(<SocialLinks links={[snsOf({ sns_name: 'zenn' })]} />);

        expect(screen.getByRole('link', { name: 'zennのプロフィールを開く' })).toBeInTheDocument();
    });

    it('渡した順にそのまま並べる', () => {
        render(
            <SocialLinks
                links={[
                    snsOf({ sns_name: 'github', sns_url: 'https://github.com/example' }),
                    snsOf({ sns_name: 'zenn', sns_url: 'https://zenn.dev/example' }),
                    snsOf({ sns_name: 'qiita', sns_url: 'https://qiita.com/example' }),
                ]}
            />,
        );

        const names = screen.getAllByRole('link').map((link) => link.textContent);
        expect(names).toEqual(['github', 'zenn', 'qiita']);
    });

    it('リンクが 1 件も無ければリンクを描画しない', () => {
        render(<SocialLinks links={[]} />);

        expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('className を渡しても既定のレイアウトが消えない', () => {
        const { container } = render(<SocialLinks links={[snsOf()]} className="mt-6" />);

        const wrapper = container.firstElementChild;
        expect(wrapper).toHaveClass('mt-6');
        expect(wrapper).toHaveClass('flex');
    });

    // --- 異常系 ---
    it('sns_img は画面に出さない（明るい地で見えなくなる白一色の SVG のため）', () => {
        // データは変更しない方針（issue #135）のため、画像ではなく名前のテキストで出す。
        // 将来うっかり <img> を戻したら落ちるようにしておく。
        const { container } = render(<SocialLinks links={[snsOf()]} />);

        expect(container.querySelectorAll('img')).toHaveLength(0);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('同じ SNS 名でも URL が違えば両方描画する（名前で束ねない）', () => {
        // データ上は同じサービスの複数アカウントが並びうる。件数を名前で畳むと
        // 片方が黙って消えるため、渡された件数をそのまま出すことを固定する。
        render(
            <SocialLinks
                links={[
                    snsOf({ sns_name: 'github', sns_url: 'https://github.com/a' }),
                    snsOf({ sns_name: 'github', sns_url: 'https://github.com/b' }),
                ]}
            />,
        );

        const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
        expect(hrefs).toEqual(['https://github.com/a', 'https://github.com/b']);
    });
});
