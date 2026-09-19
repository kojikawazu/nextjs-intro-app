import { describe, it, expect, afterEach, vi } from 'vitest';
import sitemap from './sitemap';

/** `getSiteUrl()` のフォールバック先（本番の正規オリジン）を基準にした URL。 */
const CANONICAL_TOP = 'https://introtechkkplus.com/';

// `sitemap()` は呼び出しごとに SITE_URL を読むため、テスト単位で差し替える。詳細は site-url.test.ts 参照。
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

describe('sitemap', () => {
    afterEach(() => {
        setSiteUrlEnv(ORIGINAL_SITE_URL);
        vi.restoreAllMocks();
    });

    // --- 正常系 ---
    it('単一ページ構成のためエントリはトップページ 1 件のみを返す', () => {
        setSiteUrlEnv(undefined);
        const entries = sitemap();

        expect(entries).toHaveLength(1);
        expect(entries[0].url).toBe(CANONICAL_TOP);
    });

    it('トップページに月次更新・優先度 1 を設定する', () => {
        setSiteUrlEnv(undefined);
        const [top] = sitemap();

        expect(top.changeFrequency).toBe('monthly');
        expect(top.priority).toBe(1);
        expect(top.lastModified).toBeInstanceOf(Date);
    });

    // --- 準正常系（想定内の異常入力）---
    it('SITE_URL が指定された環境ではそのオリジンに追随する', () => {
        setSiteUrlEnv('https://staging.example.test');
        expect(sitemap()[0].url).toBe('https://staging.example.test/');
    });

    it('SITE_URL の末尾スラッシュが重複しても URL が二重スラッシュにならない', () => {
        setSiteUrlEnv('https://example.test/');
        expect(sitemap()[0].url).toBe('https://example.test/');
    });

    // --- 異常系 ---
    it('SITE_URL が不正でも例外を投げず正規オリジンで生成する', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        setSiteUrlEnv('not a url');

        expect(() => sitemap()).not.toThrow();
        expect(sitemap()[0].url).toBe(CANONICAL_TOP);
    });

    it('SITE_URL が空文字でも正規オリジンで生成する', () => {
        setSiteUrlEnv('');
        expect(sitemap()[0].url).toBe(CANONICAL_TOP);
    });
});
