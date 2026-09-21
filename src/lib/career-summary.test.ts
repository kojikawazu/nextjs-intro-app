import { describe, it, expect } from 'vitest';
import { summarizeCareers } from './career-summary';
import type { CareerData } from '@/types/portfolio';

/**
 * 経歴 1 件分のテストデータを組み立てる。
 *
 * `CareerData` は 9 フィールドを持つが、本関数が見るのは `career_start` と
 * `career_skill_stack` の 2 つだけ。残りを毎回書くとテストの意図が埋もれるため既定値で埋める。
 *
 * @param overrides - 上書きしたいフィールド
 * @returns 経歴データ
 */
function careerOf(overrides: Partial<CareerData> = {}): CareerData {
    return {
        career_title: 'テスト案件',
        career_start: '2020年4月',
        career_end: 'now',
        career_member: '3名',
        career_contents: '内容',
        career_skill_stack: [],
        career_skill_phase: [],
        career_role: '役割',
        ...overrides,
    };
}

describe('summarizeCareers', () => {
    // --- 正常系 ---
    it('件数・ユニーク技術数・最古の開始年を返す', () => {
        const careers = [
            careerOf({ career_start: '2021年5月', career_skill_stack: ['Java8', 'Docker'] }),
            careerOf({ career_start: '2015年4月', career_skill_stack: ['Java8', 'Python3'] }),
        ];

        expect(summarizeCareers(careers)).toEqual({
            projectCount: 2,
            technologyCount: 3,
            startYear: 2015,
        });
    });

    // --- 準正常系（想定内の入力バリエーション）---
    it('空配列なら件数 0・技術 0・開始年なし', () => {
        expect(summarizeCareers([])).toEqual({
            projectCount: 0,
            technologyCount: 0,
            startYear: null,
        });
    });

    it('同じ技術が複数案件に出ても 1 件として数える', () => {
        const careers = [
            careerOf({ career_skill_stack: ['Docker'] }),
            careerOf({ career_skill_stack: ['Docker'] }),
        ];

        expect(summarizeCareers(careers).technologyCount).toBe(1);
    });

    it('大文字小文字違いは同じ技術として数える', () => {
        const careers = [careerOf({ career_skill_stack: ['Docker', 'docker', 'DOCKER'] })];

        expect(summarizeCareers(careers).technologyCount).toBe(1);
    });

    it('前後の空白を無視して数える', () => {
        const careers = [careerOf({ career_skill_stack: ['  Docker  ', 'Docker'] })];

        expect(summarizeCareers(careers).technologyCount).toBe(1);
    });

    it('技術が 1 件も無い案件でも件数には数える', () => {
        expect(summarizeCareers([careerOf({ career_skill_stack: [] })])).toEqual({
            projectCount: 1,
            technologyCount: 0,
            startYear: 2020,
        });
    });

    it('月が 1 桁でも 2 桁でも同じ年として扱う', () => {
        const careers = [
            careerOf({ career_start: '2019年1月' }),
            careerOf({ career_start: '2019年01月' }),
        ];

        expect(summarizeCareers(careers).startYear).toBe(2019);
    });

    // --- 異常系（想定外の入力でも安全に失敗する）---
    it('開始年月が不正な案件は開始年の算出から除外する（件数と技術数には影響しない）', () => {
        const careers = [
            careerOf({ career_start: '不明', career_skill_stack: ['Docker'] }),
            careerOf({ career_start: '2018年7月', career_skill_stack: ['Java8'] }),
        ];

        // 1 件の表記ゆれでページ全体を落とさない、という設計判断を固定する。
        expect(summarizeCareers(careers)).toEqual({
            projectCount: 2,
            technologyCount: 2,
            startYear: 2018,
        });
    });

    it('すべての開始年月が不正なら開始年は null', () => {
        const careers = [careerOf({ career_start: '' }), careerOf({ career_start: 'now' })];

        expect(summarizeCareers(careers).startYear).toBeNull();
    });

    it('技術に文字列以外が混ざっても落ちずに無視する', () => {
        // 外部データ（GCS の JSON）由来のため、型が保証されない入力が来うる。
        const stack = ['Docker', null, undefined, 42, {}] as unknown as string[];

        expect(summarizeCareers([careerOf({ career_skill_stack: stack })]).technologyCount).toBe(1);
    });

    it('空文字・空白のみの技術は数えない', () => {
        const careers = [careerOf({ career_skill_stack: ['', '   ', 'Docker'] })];

        expect(summarizeCareers(careers).technologyCount).toBe(1);
    });
});
