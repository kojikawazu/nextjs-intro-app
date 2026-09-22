import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
    // --- 正常系 ---
    it('コピーライトとサイト名を表示する', () => {
        render(<SiteFooter copyright="© 2024 Example" siteTitle="TechProfile Pro" />);

        expect(screen.getByText('© 2024 Example')).toBeInTheDocument();
        expect(screen.getByText('TechProfile Pro')).toBeInTheDocument();
    });

    it('ランドマークとして footer を出す', () => {
        // フッターは見出しを持たないため、支援技術からの到達手段はランドマークだけになる。
        render(<SiteFooter copyright="© 2024 Example" siteTitle="TechProfile Pro" />);

        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    // --- 準正常系 ---
    it('コピーライトが空でもフッターの枠は残る', () => {
        // 枠が消えると本文と地続きになり、ページの終わりが分からなくなる。
        render(<SiteFooter copyright="" siteTitle="TechProfile Pro" />);

        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        expect(screen.getByText('TechProfile Pro')).toBeInTheDocument();
    });

    it('両方が空でもフッターの枠は残る', () => {
        render(<SiteFooter copyright="" siteTitle="" />);

        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
});
