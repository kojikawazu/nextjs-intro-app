import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CareerCard, type CareerCardProps } from './CareerCard';

/**
 * 既定値を埋めた `CareerCard` を描画する。
 *
 * props が 8 つあり、毎回すべて書くとテストの意図が埋もれるため、
 * 各テストで関係するものだけを上書きする。
 *
 * @param overrides - 上書きしたい props
 * @returns Testing Library の描画結果
 */
function renderCard(overrides: Partial<CareerCardProps> = {}) {
    const props: CareerCardProps = {
        title: 'テスト案件',
        period: '2024年1月 - 現在',
        teamSize: '5名',
        description: '案件の説明文',
        techStack: [],
        phases: [],
        role: 'バックエンド担当',
        ...overrides,
    };

    return render(<CareerCard {...props} />);
}

describe('CareerCard', () => {
    // --- 正常系 ---
    it('タイトル・期間・チーム規模・説明・役割を表示する', () => {
        renderCard();

        expect(screen.getByRole('heading', { name: 'テスト案件' })).toBeInTheDocument();
        expect(screen.getByText(/2024年1月 - 現在/)).toBeInTheDocument();
        expect(screen.getByText(/5名/)).toBeInTheDocument();
        expect(screen.getByText('案件の説明文')).toBeInTheDocument();
        expect(screen.getByText('バックエンド担当')).toBeInTheDocument();
    });

    it('技術スタックを分類ラベル付きでまとめて表示する', () => {
        renderCard({ techStack: ['TypeScript', 'PHP', 'Nuxt.js', 'Vitest'] });

        // 分類見出しごとに、技術は 1 件ずつ独立したチップとして出す。
        // 読点で連ねると「文章」として読まれ、個々の技術を拾い読みできない。
        expect(screen.getByText('言語')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('PHP')).toBeInTheDocument();
        expect(screen.queryByText('TypeScript、PHP')).not.toBeInTheDocument();
        expect(screen.getByText('フレームワーク')).toBeInTheDocument();
        expect(screen.getByText('Nuxt.js')).toBeInTheDocument();
        expect(screen.getByText('テスト')).toBeInTheDocument();
        expect(screen.getByText('Vitest')).toBeInTheDocument();
    });

    // --- 準正常系（項目の有無による出し分け）---
    it('進行中の案件には「現在」を表示する', () => {
        renderCard({ isCurrent: true });

        expect(screen.getByText('現在')).toBeInTheDocument();
    });

    it('過去の案件には「現在」を表示しない', () => {
        renderCard({ isCurrent: false });

        expect(screen.queryByText('現在')).not.toBeInTheDocument();
    });

    it('技術スタックが空なら見出しごと描画しない', () => {
        renderCard({ techStack: [] });

        expect(screen.queryByRole('heading', { name: '技術スタック' })).not.toBeInTheDocument();
    });

    it('担当フェーズが空なら見出しごと描画しない', () => {
        renderCard({ phases: [] });

        expect(screen.queryByRole('heading', { name: '担当フェーズ' })).not.toBeInTheDocument();
    });

    it('担当フェーズは中黒区切りの 1 行にまとめる', () => {
        renderCard({ phases: ['設計', '実装', 'テスト'] });

        expect(screen.getByText('設計 ・ 実装 ・ テスト')).toBeInTheDocument();
    });

    it('案件ごとに登場する分類が違っても、中身のある分類だけを出す', () => {
        // PC 基盤の案件にはテストも設計も無い、という実データの性質を反映した確認。
        renderCard({ techStack: ['Java8', 'Miracle Linux5~8'] });

        expect(screen.getByText('言語')).toBeInTheDocument();
        expect(screen.getByText('OS・ミドルウェア')).toBeInTheDocument();
        expect(screen.queryByText('テスト')).not.toBeInTheDocument();
        expect(screen.queryByText('設計')).not.toBeInTheDocument();
    });

    // --- 異常系 ---
    it('対応表に無い技術は「その他」として表示する（黙って消さない）', () => {
        renderCard({ techStack: ['COBOL'] });

        expect(screen.getByText('その他')).toBeInTheDocument();
        expect(screen.getByText('COBOL')).toBeInTheDocument();
    });

    it('役割が空文字でも見出しは残す（項目の欠落が分かるようにする）', () => {
        renderCard({ role: '' });

        expect(screen.getByRole('heading', { name: '役割' })).toBeInTheDocument();
    });
});
