import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

const summary = { projectCount: 7, technologyCount: 82, startYear: 2015 };

describe('HeroSection', () => {
    // --- 正常系 ---
    it('見出し・リード文・3 つの数値を表示する', () => {
        render(<HeroSection lead="専門はバックエンド開発。" summary={summary} />);

        expect(
            screen.getByRole('heading', { name: 'Solving Problems with Technology' }),
        ).toBeInTheDocument();
        expect(screen.getByText('専門はバックエンド開発。')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByText('82')).toBeInTheDocument();
        expect(screen.getByText('2015')).toBeInTheDocument();
    });

    // --- 準正常系 ---
    it('リード文が無ければ引用パネルごと描画しない', () => {
        // about_contents の段落数が足りない場合に起こりうる。
        const { container } = render(<HeroSection summary={summary} />);

        expect(container.querySelectorAll('.quote-panel')).toHaveLength(0);
        expect(
            screen.getByRole('heading', { name: 'Solving Problems with Technology' }),
        ).toBeInTheDocument();
    });

    it('経歴開始年が取れなければダッシュを出す', () => {
        // career_start がすべて不正な場合、summarizeCareers は null を返す。
        // 空欄にすると「項目が無い」のか「値が取れなかった」のか区別できない。
        render(<HeroSection summary={{ ...summary, startYear: null }} />);

        expect(screen.getByText('—')).toBeInTheDocument();
    });

    // --- 異常系 ---
    it('件数が 0 でも 0 と表示する', () => {
        // 0 を falsy として握りつぶすと数値帯の枠だけが残り、読み手が値の欠落に気づけない。
        render(<HeroSection summary={{ projectCount: 0, technologyCount: 0, startYear: null }} />);

        expect(screen.getAllByText('0')).toHaveLength(2);
    });
});
