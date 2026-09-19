import { describe, it, expect } from 'vitest';
import { escapeHtml } from './html-escape';

describe('escapeHtml', () => {
    // --- 正常系（エスケープ対象を含まない通常の入力）---
    it('特殊文字を含まない文字列はそのまま返す', () => {
        expect(escapeHtml('山田太郎')).toBe('山田太郎');
    });

    it('通常の問い合わせ文はそのまま返す', () => {
        expect(escapeHtml('お世話になっております。ご連絡いたしました。')).toBe(
            'お世話になっております。ご連絡いたしました。',
        );
    });

    // --- 準正常系（想定内の異常入力：HTML の特殊文字が混ざる）---
    it('山括弧を実体参照へ変換する', () => {
        expect(escapeHtml('<b>')).toBe('&lt;b&gt;');
    });

    it('アンパサンドを実体参照へ変換する', () => {
        expect(escapeHtml('A&B社')).toBe('A&amp;B社');
    });

    it('ダブルクォートを実体参照へ変換する', () => {
        expect(escapeHtml('株式会社"例"')).toBe('株式会社&quot;例&quot;');
    });

    it('シングルクォートは数値参照（&#39;）へ変換する', () => {
        // `&apos;` は HTML4 の実体参照に無く古いメールクライアントで解決されないため、
        // 数値参照であることを仕様として固定する。
        expect(escapeHtml("it's")).toBe('it&#39;s');
    });

    it('5種類すべてが混在しても一度に変換する', () => {
        expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
    });

    it('連続する特殊文字をすべて変換する', () => {
        expect(escapeHtml('<<>>')).toBe('&lt;&lt;&gt;&gt;');
    });

    it('エスケープ済みの文字列は二重にエスケープされる（べき等ではない）', () => {
        // 同じ値へ二度適用すると `&` が再変換される。呼び出しは出力直前の 1 回だけにすること。
        expect(escapeHtml('&amp;')).toBe('&amp;amp;');
    });

    // --- 異常系（攻撃を意図した入力・想定外の入力）---
    it('script タグは実行され得ない文字列になる', () => {
        expect(escapeHtml('<script>alert(1)</script>')).toBe(
            '&lt;script&gt;alert(1)&lt;/script&gt;',
        );
    });

    it('属性を伴うタグ注入は山括弧とクォートの両方が変換される', () => {
        expect(escapeHtml('<img src="x" onerror="alert(1)">')).toBe(
            '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;',
        );
    });

    it('属性値を抜け出す目的のクォート単体も変換する', () => {
        expect(escapeHtml('" onmouseover="alert(1)')).toBe('&quot; onmouseover=&quot;alert(1)');
    });

    it('空文字は空文字を返す', () => {
        expect(escapeHtml('')).toBe('');
    });

    it('改行とタブは変換しない（HTML の文法上の意味を持たないため）', () => {
        expect(escapeHtml('1行目\n\t2行目')).toBe('1行目\n\t2行目');
    });

    it('サロゲートペア（絵文字）を壊さない', () => {
        expect(escapeHtml('確認しました👍')).toBe('確認しました👍');
    });

    it('上限（2000文字）いっぱいの入力もすべて変換する', () => {
        const input = '<'.repeat(2000);
        expect(escapeHtml(input)).toBe('&lt;'.repeat(2000));
    });
});
