import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CareerSection } from './CareerSection';
import type { CareerData } from '@/types/portfolio';

/**
 * 経歴 1 件分のテストデータを作る。
 *
 * @param overrides - 上書きしたいフィールド
 * @returns `CareerData` 1 件
 */
function career(overrides: Partial<CareerData> = {}): CareerData {
    return {
        career_title: 'テスト案件',
        career_start: '2023年04月',
        career_end: '2024年03月',
        career_member: '5名',
        career_contents: '案件の説明',
        career_skill_stack: [],
        career_skill_phase: [],
        career_role: '担当',
        ...overrides,
    };
}

describe('CareerSection', () => {
    // --- 正常系 ---
    it('見出し・件数・各案件を表示する', () => {
        render(
            <CareerSection
                title="Career"
                careers={[career({ career_title: '案件A' }), career({ career_title: '案件B' })]}
            />,
        );

        expect(screen.getByRole('heading', { name: 'Career' })).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '案件A' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '案件B' })).toBeInTheDocument();
    });

    it('渡された配列の順でそのまま並べる', () => {
        // GCS 側は「主プロジェクト → 関連・兼任」でグルーピングしており時系列降順ではない。
        // ここで日付順に並べ替えると、意図した並びが崩れる。
        render(
            <CareerSection
                title="Career"
                careers={[
                    career({ career_title: '古い案件', career_start: '2015年04月' }),
                    career({ career_title: '新しい案件', career_start: '2024年04月' }),
                ]}
            />,
        );

        const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
        expect(titles).toEqual(['古い案件', '新しい案件']);
    });

    // --- 準正常系 ---
    it('career_end が "now" の案件だけ「現在」を出す', () => {
        // 'now' は GCS のデータ形式に属する約束。判定をカード側に持たせず、ここで解釈する。
        render(
            <CareerSection
                title="Career"
                careers={[career({ career_end: 'now' }), career({ career_end: '2020年03月' })]}
            />,
        );

        expect(screen.getAllByText('現在')).toHaveLength(1);
    });

    it('経歴が 0 件でも見出しと件数 0 を出す', () => {
        render(<CareerSection title="Career" careers={[]} />);

        expect(screen.getByRole('heading', { name: 'Career' })).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    });

    // --- 異常系 ---
    it('日付が不正な案件があれば例外が伝播する', () => {
        // ここで握りつぶすと「本文が無いのに 200 が返る」状態になる。
        // page.tsx まで伝播させ、error.tsx に倒すのが既存の方針（page.tsx の JSDoc 参照）。
        expect(() =>
            render(
                <CareerSection title="Career" careers={[career({ career_start: '2023-04' })]} />,
            ),
        ).toThrow(/Invalid format/);
    });
});
