import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatCareerPeriod } from './career-period';

describe('formatCareerPeriod', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    // --- 正常系 ---
    it('開始と終了の年月を「 - 」で繋ぐ', () => {
        expect(formatCareerPeriod('2023年04月', '2024年03月')).toBe('2023年4月 - 2024年3月');
    });

    it('ゼロ埋めを外して表示する', () => {
        // 入力は YYYY年MM月 だが、表示は YYYY年M月（先頭の 0 を落とす）。
        expect(formatCareerPeriod('2019年01月', '2020年07月')).toBe('2019年1月 - 2020年7月');
    });

    // --- 準正常系 ---
    it('終了が "now" なら「現在」を出す', () => {
        expect(formatCareerPeriod('2021年05月', 'now')).toBe('2021年5月 - 現在');
    });

    it('終了が "now" のとき、実行時刻が変わっても表示は変わらない', () => {
        // 'now' は new Date() として解釈されるが、その値は表示に使わない。
        // 月跨ぎで表示がぶれないことを、時刻を固定して確かめる。
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-12-31T23:59:59Z'));
        const atYearEnd = formatCareerPeriod('2021年05月', 'now');

        vi.setSystemTime(new Date('2027-01-01T00:00:01Z'));
        const afterNewYear = formatCareerPeriod('2021年05月', 'now');

        expect(atYearEnd).toBe('2021年5月 - 現在');
        expect(afterNewYear).toBe(atYearEnd);
    });

    // --- 異常系 ---
    it('開始が解釈できない形式なら例外を投げる', () => {
        expect(() => formatCareerPeriod('2023-04', '2024年03月')).toThrow(/Invalid format/);
    });

    it('終了が解釈できない形式なら例外を投げる', () => {
        // 'now' 以外の未知の文字列は日付として解釈を試み、失敗する。
        expect(() => formatCareerPeriod('2023年04月', '未定')).toThrow(/Invalid format/);
    });
});
