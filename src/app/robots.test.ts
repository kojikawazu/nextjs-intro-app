import { describe, it, expect, afterEach, vi } from 'vitest';
import robots from './robots';

/** `getSiteUrl()` のフォールバック先（本番の正規オリジン）。 */
const CANONICAL_HOST = 'introtechkkplus.com';

// `robots()` は呼び出しごとに SITE_URL を読むため、テスト単位で差し替える。詳細は site-url.test.ts 参照。
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

describe('robots', () => {
    afterEach(() => {
        setSiteUrlEnv(ORIGINAL_SITE_URL);
        vi.restoreAllMocks();
    });

    // --- 正常系 ---
    it('全クローラに対して全ページを許可する', () => {
        setSiteUrlEnv(undefined);
        expect(robots().rules).toEqual({ userAgent: '*', allow: '/' });
    });

    it('sitemap と正規ホストを正規オリジンで出力する', () => {
        setSiteUrlEnv(undefined);
        const result = robots();

        expect(result.sitemap).toBe(`https://${CANONICAL_HOST}/sitemap.xml`);
        expect(result.host).toBe(CANONICAL_HOST);
    });

    // --- 準正常系（想定内の異常入力）---
    it('SITE_URL が指定された環境ではそのオリジンに追随する', () => {
        setSiteUrlEnv('https://staging.example.test');
        const result = robots();

        expect(result.sitemap).toBe('https://staging.example.test/sitemap.xml');
        expect(result.host).toBe('staging.example.test');
    });

    it('SITE_URL の末尾スラッシュが重複しても sitemap URL が二重スラッシュにならない', () => {
        setSiteUrlEnv('https://example.test/');
        expect(robots().sitemap).toBe('https://example.test/sitemap.xml');
    });

    // --- 異常系 ---
    it('SITE_URL が不正でも例外を投げず正規オリジンで生成する', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        setSiteUrlEnv('not a url');

        expect(() => robots()).not.toThrow();
        expect(robots().host).toBe(CANONICAL_HOST);
    });

    it('SITE_URL が空文字でも正規ホストを返す', () => {
        setSiteUrlEnv('');
        expect(robots().host).toBe(CANONICAL_HOST);
    });
});
