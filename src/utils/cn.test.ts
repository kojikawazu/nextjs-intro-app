import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
    // --- 正常系 ---
    it('単一のクラス名をそのまま返す', () => {
        expect(cn('text-white')).toBe('text-white');
    });

    it('複数のクラス名を半角スペース区切りで結合する', () => {
        expect(cn('text-white', 'bg-black')).toBe('text-white bg-black');
    });

    it('真の条件のクラスのみ結合し、偽の条件は除外する', () => {
        expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
    });

    it('オブジェクト記法では値が真のキーのみ採用する', () => {
        expect(cn({ 'text-white': true, 'text-black': false })).toBe('text-white');
    });

    it('競合する Tailwind クラスは後勝ちで解決する', () => {
        expect(cn('px-4', 'px-6')).toBe('px-6');
    });

    // --- 準正常系（想定内の異常入力）---
    it('undefined / null を無視して結合する', () => {
        expect(cn('base', undefined, null, 'end')).toBe('base end');
    });

    it('引数なしの場合は空文字を返す', () => {
        expect(cn()).toBe('');
    });
});
