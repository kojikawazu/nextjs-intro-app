import { describe, it, expect, afterEach, vi } from 'vitest';
import { getSiteUrl } from './site-url';

/** 実装側の `CANONICAL_SITE_URL` が `URL` で正規化された形（末尾スラッシュ付き）。 */
const CANONICAL = 'https://introtechkkplus.com/';

/**
 * `process.env` を直接操作する理由:
 * `getSiteUrl()` は呼び出しごとに `process.env.SITE_URL` を読むため、テストごとに値を差し替える必要がある。
 * `vi.stubEnv` は「変数を未定義に戻す」挙動が Vitest のバージョンに依存するため、
 * ここでは元の値を退避して手動で復元し、バージョン差の影響を受けないようにしている。
 */
const ORIGINAL_SITE_URL = process.env.SITE_URL;

/**
 * `SITE_URL` を指定値に差し替える。`undefined` を渡すと未設定状態にする。
 *
 * @param value - 設定する値。未設定状態にしたい場合は `undefined`
 */
function setSiteUrlEnv(value: string | undefined): void {
    if (value === undefined) {
        delete process.env.SITE_URL;
        return;
    }
    process.env.SITE_URL = value;
}

describe('getSiteUrl', () => {
    afterEach(() => {
        setSiteUrlEnv(ORIGINAL_SITE_URL);
        vi.restoreAllMocks();
    });

    // --- 正常系 ---
    it('SITE_URL が未設定なら本番の正規オリジンを返す', () => {
        setSiteUrlEnv(undefined);
        expect(getSiteUrl().href).toBe(CANONICAL);
    });

    it('SITE_URL が設定されていればその値を優先する', () => {
        setSiteUrlEnv('https://staging.example.test');
        expect(getSiteUrl().href).toBe('https://staging.example.test/');
    });

    // --- 準正常系（想定内の異常入力）---
    it('末尾スラッシュの有無にかかわらず同じオリジンに正規化する', () => {
        setSiteUrlEnv('https://example.test');
        const withoutSlash = getSiteUrl().href;

        setSiteUrlEnv('https://example.test/');
        const withSlash = getSiteUrl().href;

        expect(withoutSlash).toBe('https://example.test/');
        expect(withSlash).toBe('https://example.test/');
    });

    it('前後に空白を含む値はトリムして解釈する', () => {
        setSiteUrlEnv('  https://example.test  ');
        expect(getSiteUrl().href).toBe('https://example.test/');
    });

    it('空白のみの値は未設定とみなして正規オリジンを返す', () => {
        setSiteUrlEnv('   ');
        expect(getSiteUrl().href).toBe(CANONICAL);
    });

    // --- 異常系 ---
    it('スキームを欠いた値は例外を投げず正規オリジンにフォールバックする', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        setSiteUrlEnv('introtechkkplus.com');

        expect(getSiteUrl().href).toBe(CANONICAL);
        expect(warn).toHaveBeenCalledTimes(1);
    });

    it('URL として解釈できない値は例外を投げず正規オリジンにフォールバックする', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        setSiteUrlEnv('not a url');

        expect(getSiteUrl().href).toBe(CANONICAL);
        expect(warn).toHaveBeenCalledTimes(1);
    });

    it('空文字は未設定扱いとし、警告を出さずに正規オリジンを返す', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        setSiteUrlEnv('');

        expect(getSiteUrl().href).toBe(CANONICAL);
        expect(warn).not.toHaveBeenCalled();
    });
});
