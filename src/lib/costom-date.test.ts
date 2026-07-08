import { describe, it, expect } from 'vitest';
import { toDateString } from './costom-date';

describe('toDateString', () => {
    // --- 正常系 ---
    it('「YYYY年M月」を「YYYY/MM/01」に変換する', () => {
        expect(toDateString('2024年1月')).toBe('2024/01/01');
    });

    it('2桁の月はそのまま2桁で返す', () => {
        expect(toDateString('2023年12月')).toBe('2023/12/01');
    });

    it('1桁の月は0埋めして2桁にする', () => {
        expect(toDateString('2020年3月')).toBe('2020/03/01');
    });

    // --- 異常系 ---
    it('区切りが異なる形式（ハイフン）は例外を投げる', () => {
        expect(() => toDateString('2024-01')).toThrow('Invalid format: 2024-01');
    });

    it('空文字は例外を投げる', () => {
        expect(() => toDateString('')).toThrow('Invalid format:');
    });

    it('月が欠落した形式は例外を投げる', () => {
        expect(() => toDateString('2024年')).toThrow('Invalid format: 2024年');
    });

    it('年が4桁でない形式は例外を投げる', () => {
        expect(() => toDateString('24年3月')).toThrow('Invalid format: 24年3月');
    });

    // --- 準正常系（想定内の異常入力：範囲外の月）---
    // 現状の実装は月の範囲（1〜12）を検証しないため、範囲外でもそのまま整形される。
    // この挙動は仕様（docs/05）でも未規定であり、範囲バリデーションが無いことを明示的に固定する。
    it('範囲外の月（13月）でも例外にせずそのまま整形する（範囲未検証）', () => {
        expect(toDateString('2024年13月')).toBe('2024/13/01');
    });

    it('月が0でも例外にせずそのまま整形する（範囲未検証）', () => {
        expect(toDateString('2024年0月')).toBe('2024/00/01');
    });
});
