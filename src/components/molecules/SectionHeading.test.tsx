import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeading } from './SectionHeading';

describe('SectionHeading', () => {
    // --- 正常系 ---
    it('見出しと件数を表示する', () => {
        render(<SectionHeading title="Career" count={7} />);

        expect(screen.getByRole('heading', { name: 'Career' })).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('区切りの罫線を描画する', () => {
        // この罫線がセクションの区切りを兼ねるため、見出しと同じ要素として出ることが仕様。
        const { container } = render(<SectionHeading title="About" />);

        expect(container.querySelectorAll('hr')).toHaveLength(1);
    });

    // --- 準正常系 ---
    it('件数を渡さなければ件数を描画しない', () => {
        // About / Contact のように「件数」の概念が無いセクションで使う。
        const { container } = render(<SectionHeading title="About" />);

        expect(container.querySelectorAll('span')).toHaveLength(0);
        expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    });

    it('件数が 0 なら 0 と表示する', () => {
        // 0 を falsy として握りつぶすと「件数の概念が無い」のと区別がつかなくなる。
        // 掲載が 0 件であること自体は、隠さず出す。
        render(<SectionHeading title="Articles" count={0} />);

        expect(screen.getByText('0')).toBeInTheDocument();
    });

    // --- 異常系 ---
    it('見出しが空文字でも罫線は残る', () => {
        // 見出しは GCS の navbar_data 由来のため空になりうる。
        // 罫線まで消えると、セクションの切れ目が画面から失われる。
        const { container } = render(<SectionHeading title="" />);

        expect(container.querySelectorAll('hr')).toHaveLength(1);
        expect(container.querySelectorAll('h2')).toHaveLength(1);
    });
});
