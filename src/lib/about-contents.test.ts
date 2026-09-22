import { describe, it, expect } from 'vitest';
import { splitAboutContents } from './about-contents';

describe('splitAboutContents', () => {
    // --- 正常系 ---
    it('2 番目の段落を Hero へ引き上げ、残りを About に残す', () => {
        const result = splitAboutContents(['一段落目', '二段落目', '三段落目', '四段落目']);

        expect(result.heroLead).toBe('二段落目');
        expect(result.aboutParagraphs).toEqual(['一段落目', '三段落目', '四段落目']);
    });

    // --- 準正常系（段落数が想定どおりでない）---
    it('段落が 2 つなら About には先頭だけが残る', () => {
        const result = splitAboutContents(['一段落目', '二段落目']);

        expect(result.heroLead).toBe('二段落目');
        expect(result.aboutParagraphs).toEqual(['一段落目']);
    });

    it('段落が 1 つなら Hero のリードは取れない', () => {
        const result = splitAboutContents(['一段落目']);

        expect(result.heroLead).toBeUndefined();
        expect(result.aboutParagraphs).toEqual(['一段落目']);
    });

    it('空配列でも例外を投げない', () => {
        // 掲載データは手書きのため、段落が 0 件になる状態もありうる。
        const result = splitAboutContents([]);

        expect(result.heroLead).toBeUndefined();
        expect(result.aboutParagraphs).toEqual([]);
    });

    // --- 異常系 ---
    it('文字列でない要素は About の段落から除く', () => {
        // GCS の JSON はスキーマ検証を通っていないため、配列に文字列以外が混じりうる。
        // 描画時に落ちるより、落として表示を続ける方が被害が小さい。
        const contents = ['一段落目', '二段落目', null, 3, '五段落目'] as unknown as string[];
        const result = splitAboutContents(contents);

        expect(result.aboutParagraphs).toEqual(['一段落目', '五段落目']);
    });
});
