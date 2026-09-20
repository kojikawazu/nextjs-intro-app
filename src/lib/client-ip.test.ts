import { describe, it, expect } from 'vitest';
import { resolveClientIp } from './client-ip';

/**
 * ヘッダー名と値の組から `Headers` を組み立てる。
 *
 * `resolveClientIp` は `Headers` を受け取るため、テストごとに new する定型を畳む。
 *
 * @param init - 設定するヘッダー
 * @returns 組み立てた `Headers`
 */
function headersOf(init: Record<string, string>): Headers {
    return new Headers(init);
}

describe('resolveClientIp', () => {
    // --- 正常系 ---
    it('CF-Connecting-IP があればそれを返す', () => {
        expect(resolveClientIp(headersOf({ 'cf-connecting-ip': '203.0.113.5' }))).toBe(
            '203.0.113.5',
        );
    });

    it('X-Forwarded-For が 1 件ならその値を返す', () => {
        expect(resolveClientIp(headersOf({ 'x-forwarded-for': '203.0.113.5' }))).toBe(
            '203.0.113.5',
        );
    });

    // --- 準正常系（想定内の入力バリエーション）---
    it('CF-Connecting-IP を X-Forwarded-For より優先する', () => {
        const headers = headersOf({
            'cf-connecting-ip': '203.0.113.5',
            'x-forwarded-for': '198.51.100.1, 192.0.2.1',
        });

        expect(resolveClientIp(headers)).toBe('203.0.113.5');
    });

    it('X-Forwarded-For が複数ある場合は右端（インフラが追記した値）を返す', () => {
        // 左端はクライアントが詐称できるため採らない。
        const headers = headersOf({ 'x-forwarded-for': '198.51.100.1, 192.0.2.1, 203.0.113.5' });

        expect(resolveClientIp(headers)).toBe('203.0.113.5');
    });

    it('詐称された左端の値を採用しない', () => {
        // 攻撃者が `X-Forwarded-For: 1.2.3.4` を送ると、インフラが実 IP を末尾へ追記する。
        const headers = headersOf({ 'x-forwarded-for': '1.2.3.4, 203.0.113.5' });

        expect(resolveClientIp(headers)).toBe('203.0.113.5');
    });

    it('前後の空白を取り除いて返す', () => {
        expect(
            resolveClientIp(headersOf({ 'x-forwarded-for': '198.51.100.1 ,  203.0.113.5  ' })),
        ).toBe('203.0.113.5');
    });

    it('CF-Connecting-IP が空白のみなら X-Forwarded-For へ退避する', () => {
        const headers = headersOf({
            'cf-connecting-ip': '   ',
            'x-forwarded-for': '203.0.113.5',
        });

        expect(resolveClientIp(headers)).toBe('203.0.113.5');
    });

    // --- 異常系（ヘッダーが無い・壊れている）---
    it('どちらのヘッダーも無ければ null を返す', () => {
        expect(resolveClientIp(headersOf({}))).toBeNull();
    });

    it('X-Forwarded-For が空文字なら null を返す', () => {
        expect(resolveClientIp(headersOf({ 'x-forwarded-for': '' }))).toBeNull();
    });

    it('X-Forwarded-For がカンマのみなら null を返す', () => {
        expect(resolveClientIp(headersOf({ 'x-forwarded-for': ' , , ' }))).toBeNull();
    });
});
