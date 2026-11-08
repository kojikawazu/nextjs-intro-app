import { describe, expect, it } from 'vitest';
import { fillYearCounters } from '@/lib/about-year-counters';

const counters = { engineer: '2019年1月', freelance: '2021年5月' };
const text = 'エンジニアとして{engineer}年目、フリーランスとして{freelance}年目です。';

/** JST の 2026年11月8日 正午。UTC だと同日 03:00。 */
const NOV_2026 = new Date('2026-11-08T03:00:00Z');

describe('fillYearCounters', () => {
    describe('正常系', () => {
        it('起点の年月から「◯年目」を算出して置き換える', () => {
            const result = fillYearCounters([text], counters, NOV_2026);

            expect(result).toEqual({
                contents: ['エンジニアとして8年目、フリーランスとして6年目です。'],
                unresolved: [],
            });
        });

        it('起点と同じ月になった時点で 1 増える', () => {
            const before = fillYearCounters(
                ['{freelance}'],
                counters,
                new Date('2026-04-15T03:00:00Z'),
            );
            const onMonth = fillYearCounters(
                ['{freelance}'],
                counters,
                new Date('2026-05-01T03:00:00Z'),
            );

            expect(before.contents).toEqual(['5']);
            expect(onMonth.contents).toEqual(['6']);
        });

        it('プレースホルダの無い段落はそのまま返す', () => {
            const result = fillYearCounters(['専門はバックエンド開発。', text], counters, NOV_2026);

            expect(result.contents[0]).toBe('専門はバックエンド開発。');
        });
    });

    describe('準正常系', () => {
        it('counters が無ければ何も置き換えず、キーを unresolved に返す', () => {
            const result = fillYearCounters([text], undefined, NOV_2026);

            expect(result).toEqual({ contents: [text], unresolved: ['engineer', 'freelance'] });
        });

        it('プレースホルダも counters も無いデータ（移行前の形）では何も起きない', () => {
            const result = fillYearCounters(['こんにちは。'], undefined, NOV_2026);

            expect(result).toEqual({ contents: ['こんにちは。'], unresolved: [] });
        });

        it('未定義のキーは元の表記のまま残し、unresolved に 1 回だけ載せる', () => {
            const result = fillYearCounters(['{unknown}と{unknown}'], counters, NOV_2026);

            expect(result).toEqual({ contents: ['{unknown}と{unknown}'], unresolved: ['unknown'] });
        });

        it.each([
            ['区切りがスラッシュ', '2019/01'],
            ['月が 13', '2019年13月'],
            ['月が 0', '2019年0月'],
            ['空文字', ''],
        ])('起点の形式が不正（%s）なら置き換えない', (_label, value) => {
            const result = fillYearCounters(['{engineer}'], { engineer: value }, NOV_2026);

            expect(result).toEqual({ contents: ['{engineer}'], unresolved: ['engineer'] });
        });

        it('起点が未来なら 1 年目とする', () => {
            const result = fillYearCounters(['{x}'], { x: '2027年3月' }, NOV_2026);

            expect(result.contents).toEqual(['1']);
        });

        it('プロトタイプ由来のキー（toString 等）を定義済みとして扱わない', () => {
            const result = fillYearCounters(['{toString}'], counters, NOV_2026);

            expect(result).toEqual({ contents: ['{toString}'], unresolved: ['toString'] });
        });

        it('和文中の波括弧（キーとして不正な文字）はプレースホルダとみなさない', () => {
            const result = fillYearCounters(['{エンジニア}'], counters, NOV_2026);

            expect(result).toEqual({ contents: ['{エンジニア}'], unresolved: [] });
        });
    });

    describe('異常系', () => {
        it('UTC では前月でも JST で月が変わっていれば新しい月として数える', () => {
            // UTC 2026-12-31 15:00 = JST 2027-01-01 00:00。engineer は 2019年1月起点なので 9 年目に上がる。
            const result = fillYearCounters(
                ['{engineer}'],
                counters,
                new Date('2026-12-31T15:00:00Z'),
            );

            expect(result.contents).toEqual(['9']);
        });

        it('JST で月が変わる直前は前月のまま数える', () => {
            const result = fillYearCounters(
                ['{engineer}'],
                counters,
                new Date('2026-12-31T14:59:59Z'),
            );

            expect(result.contents).toEqual(['8']);
        });

        it('値が文字列でない（未検証の JSON）場合も例外にせず置き換えない', () => {
            // GCS の JSON は実行時に未検証のため、型を欺いて数値を渡し、その状況を再現する。
            const broken = { engineer: 2019 } as unknown as Record<string, string>;
            const result = fillYearCounters(['{engineer}'], broken, NOV_2026);

            expect(result).toEqual({ contents: ['{engineer}'], unresolved: ['engineer'] });
        });

        it('段落に文字列以外が混ざっても例外にせず、その要素は素通しする', () => {
            // 未検証の JSON を再現するため、型を欺いて null を混ぜる。
            const broken = [null, '{engineer}'] as unknown as string[];
            const result = fillYearCounters(broken, counters, NOV_2026);

            expect(result).toEqual({ contents: [null, '8'], unresolved: [] });
        });
    });
});
