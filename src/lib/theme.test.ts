import { describe, it, expect } from 'vitest';
import { THEME_COOKIE_NAME } from '@/constants/theme';
import { parseTheme, serializeThemeCookie } from './theme';

/**
 * `serializeThemeCookie` が返す文字列から属性を取り出す。
 *
 * `document.cookie` の文字列は `key=value; Attr=Value; Attr` 形式。属性名の比較は
 * 大文字小文字を区別しない仕様のため、小文字に寄せて突き合わせる。
 *
 * @param cookie - 組み立て済みの Cookie 文字列
 * @returns 属性名（小文字）から値へのマップ。値を持たない属性は空文字
 */
function attributesOf(cookie: string): Record<string, string> {
    return Object.fromEntries(
        cookie
            .split(';')
            .slice(1)
            .map((part) => {
                const [name, value = ''] = part.trim().split('=');
                return [name.toLowerCase(), value];
            }),
    );
}

describe('parseTheme', () => {
    // --- 正常系 ---
    it("'light' をそのまま返す", () => {
        expect(parseTheme('light')).toBe('light');
    });

    it("'dark' をそのまま返す", () => {
        expect(parseTheme('dark')).toBe('dark');
    });

    // --- 準正常系（想定内の異常入力）---
    it('Cookie が未設定なら null を返す（OS 設定に委ねる）', () => {
        expect(parseTheme(undefined)).toBeNull();
    });

    it('空文字は null を返す', () => {
        expect(parseTheme('')).toBeNull();
    });

    it('未知の値は null を返す', () => {
        expect(parseTheme('sepia')).toBeNull();
    });

    it('大文字は受け付けない（CSS セレクタと厳密に一致させるため）', () => {
        expect(parseTheme('Dark')).toBeNull();
        expect(parseTheme('DARK')).toBeNull();
    });

    it('前後に空白がある値は受け付けない', () => {
        expect(parseTheme(' dark')).toBeNull();
        expect(parseTheme('dark ')).toBeNull();
    });

    // --- 異常系（想定外の入力でも安全に失敗する）---
    it('プロトタイプ汚染を狙う値でも null を返す', () => {
        expect(parseTheme('__proto__')).toBeNull();
        expect(parseTheme('constructor')).toBeNull();
        expect(parseTheme('toString')).toBeNull();
    });

    it('属性を注入しようとする値でも null を返す', () => {
        expect(parseTheme('dark; Path=/; Domain=evil.example.com')).toBeNull();
    });

    it('極端に長い値でも null を返す', () => {
        expect(parseTheme('d'.repeat(10_000))).toBeNull();
    });
});

describe('serializeThemeCookie', () => {
    // --- 正常系 ---
    it('Cookie 名と値を先頭に置く', () => {
        expect(serializeThemeCookie('dark').startsWith(`${THEME_COOKIE_NAME}=dark;`)).toBe(true);
        expect(serializeThemeCookie('light').startsWith(`${THEME_COOKIE_NAME}=light;`)).toBe(true);
    });

    it('サイト全体で有効な Path と 1 年の Max-Age を付ける', () => {
        const attributes = attributesOf(serializeThemeCookie('dark'));

        expect(attributes.path).toBe('/');
        expect(attributes['max-age']).toBe(String(60 * 60 * 24 * 365));
    });

    it('SameSite=Lax を付ける', () => {
        expect(attributesOf(serializeThemeCookie('dark')).samesite).toBe('Lax');
    });

    // --- 準正常系（設計判断を固定する）---
    it('HttpOnly を付けない（切替時にクライアントから書き込むため）', () => {
        expect(attributesOf(serializeThemeCookie('dark'))).not.toHaveProperty('httponly');
    });

    it('Secure を付けない（http://localhost で黙って書き込みが失敗するのを避けるため）', () => {
        expect(attributesOf(serializeThemeCookie('dark'))).not.toHaveProperty('secure');
    });

    // --- 異常系（往復で壊れないこと）---
    it('書き出した値を parseTheme が同じテーマとして読み戻せる', () => {
        for (const theme of ['light', 'dark'] as const) {
            const value = serializeThemeCookie(theme).split(';')[0].split('=')[1];
            expect(parseTheme(value)).toBe(theme);
        }
    });

    it('値に Cookie 区切り文字を含めない（属性の注入が起きない）', () => {
        for (const theme of ['light', 'dark'] as const) {
            const value = serializeThemeCookie(theme).split(';')[0].split('=')[1];
            expect(value).toMatch(/^[a-z]+$/);
        }
    });
});
