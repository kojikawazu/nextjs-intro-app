import { describe, it, expect } from 'vitest';
import { sanitizeHeaderValue } from './mail-header';

describe('sanitizeHeaderValue', () => {
    // --- 正常系（制御文字を含まない通常の入力）---
    it('通常の氏名はそのまま返す', () => {
        expect(sanitizeHeaderValue('山田太郎')).toBe('山田太郎');
    });

    it('全角スペースを含む氏名を壊さない', () => {
        // U+3000 は制御文字ではないため除去対象外。
        expect(sanitizeHeaderValue('山田　太郎')).toBe('山田　太郎');
    });

    // --- 準正常系（想定内の異常入力：制御文字が混ざる）---
    it('LF を除去する', () => {
        expect(sanitizeHeaderValue('山田\n太郎')).toBe('山田太郎');
    });

    it('CR を除去する', () => {
        expect(sanitizeHeaderValue('山田\r太郎')).toBe('山田太郎');
    });

    it('CRLF を除去する', () => {
        expect(sanitizeHeaderValue('山田\r\n太郎')).toBe('山田太郎');
    });

    it('タブを除去する', () => {
        expect(sanitizeHeaderValue('山田\t太郎')).toBe('山田太郎');
    });

    it('NUL を除去する', () => {
        expect(sanitizeHeaderValue('山田\u0000太郎')).toBe('山田太郎');
    });

    it('DEL を除去する', () => {
        expect(sanitizeHeaderValue('山田\u007F太郎')).toBe('山田太郎');
    });

    it('前後の空白を落とす', () => {
        expect(sanitizeHeaderValue('  山田太郎  ')).toBe('山田太郎');
    });

    it('制御文字除去の結果として生じた前後の空白も落とす', () => {
        expect(sanitizeHeaderValue('\r\n 山田太郎 \r\n')).toBe('山田太郎');
    });

    // --- 異常系（ヘッダーインジェクションを意図した入力）---
    it('Bcc ヘッダーの注入を無力化する', () => {
        // CRLF が消えるため、後続はヘッダーではなく件名の一部になる。
        expect(sanitizeHeaderValue('山田\r\nBcc: attacker@example.com')).toBe(
            '山田Bcc: attacker@example.com',
        );
    });

    it('複数ヘッダーの注入を無力化する', () => {
        expect(sanitizeHeaderValue('山田\r\nBcc: a@example.com\r\nSubject: spam')).toBe(
            '山田Bcc: a@example.comSubject: spam',
        );
    });

    it('本文の注入（ヘッダー終端の空行）を無力化する', () => {
        // ヘッダーと本文は空行で区切られる。CRLFCRLF が消えれば本文は差し込めない。
        expect(sanitizeHeaderValue('山田\r\n\r\nこれは偽の本文です')).toBe(
            '山田これは偽の本文です',
        );
    });

    it('制御文字のみの入力は空文字を返す', () => {
        expect(sanitizeHeaderValue('\r\n\t\u0000')).toBe('');
    });

    it('空文字は空文字を返す', () => {
        expect(sanitizeHeaderValue('')).toBe('');
    });
});
