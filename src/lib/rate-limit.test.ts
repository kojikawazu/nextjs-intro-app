import { describe, it, expect, beforeEach } from 'vitest';
import { consumeRateLimit, resetRateLimitStore } from './rate-limit';

// 履歴はモジュールスコープで共有されるため、テストごとに消さないと
// 先行するテストの消費回数が後続のテストへ漏れる。
beforeEach(() => {
    resetRateLimitStore();
});

// 実装と揃えた値（10 分 / 5 回）。時間は now を明示的に渡して制御する。
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const T0 = 1_700_000_000_000;

describe('consumeRateLimit', () => {
    // --- 正常系 ---
    it('上限までは許可する', () => {
        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            expect(consumeRateLimit('ip-a', T0 + i).allowed).toBe(true);
        }
    });

    it('許可時は retryAfterSeconds が 0 になる', () => {
        expect(consumeRateLimit('ip-a', T0)).toEqual({ allowed: true, retryAfterSeconds: 0 });
    });

    // --- 準正常系（上限到達・時間経過）---
    it('上限を 1 件超えたら拒否する', () => {
        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            consumeRateLimit('ip-a', T0 + i);
        }

        expect(consumeRateLimit('ip-a', T0 + MAX_REQUESTS).allowed).toBe(false);
    });

    it('拒否時は再試行までの秒数を返す', () => {
        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            consumeRateLimit('ip-a', T0);
        }

        // 最も古い記録（T0）がウィンドウから外れるのは T0 + WINDOW_MS。
        const result = consumeRateLimit('ip-a', T0 + 60_000);
        expect(result.allowed).toBe(false);
        expect(result.retryAfterSeconds).toBe((WINDOW_MS - 60_000) / 1000);
    });

    it('ウィンドウを過ぎれば再び許可する', () => {
        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            consumeRateLimit('ip-a', T0);
        }
        expect(consumeRateLimit('ip-a', T0 + 1).allowed).toBe(false);

        expect(consumeRateLimit('ip-a', T0 + WINDOW_MS + 1).allowed).toBe(true);
    });

    it('古い記録だけが期限切れになる（スライディングウィンドウ）', () => {
        // 1 件目を T0、残り 4 件を T0 + WINDOW/2 に消費する。
        consumeRateLimit('ip-a', T0);
        for (let i = 0; i < MAX_REQUESTS - 1; i += 1) {
            consumeRateLimit('ip-a', T0 + WINDOW_MS / 2);
        }
        expect(consumeRateLimit('ip-a', T0 + WINDOW_MS / 2).allowed).toBe(false);

        // 1 件目だけが外れるため 1 枠だけ空く。
        expect(consumeRateLimit('ip-a', T0 + WINDOW_MS + 1).allowed).toBe(true);
        expect(consumeRateLimit('ip-a', T0 + WINDOW_MS + 2).allowed).toBe(false);
    });

    it('キーが異なれば互いに影響しない', () => {
        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            consumeRateLimit('ip-a', T0);
        }
        expect(consumeRateLimit('ip-a', T0).allowed).toBe(false);

        expect(consumeRateLimit('ip-b', T0).allowed).toBe(true);
    });

    // --- 異常系（拒否が続く場合・境界）---
    it('拒否されたリクエストは記録しない（連打で解除が遠のかない）', () => {
        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            consumeRateLimit('ip-a', T0);
        }

        // ウィンドウ終了間際に 10 回連打しても、解除時刻は動かない。
        for (let i = 0; i < 10; i += 1) {
            consumeRateLimit('ip-a', T0 + WINDOW_MS - 1000);
        }

        expect(consumeRateLimit('ip-a', T0 + WINDOW_MS + 1).allowed).toBe(true);
    });

    it('retryAfterSeconds は最低 1 秒を返す（0 秒にしない）', () => {
        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            consumeRateLimit('ip-a', T0);
        }

        // 解除の 1 ミリ秒前。切り上げても 1 秒未満になり得るため下限を設けている。
        const result = consumeRateLimit('ip-a', T0 + WINDOW_MS - 1);
        expect(result.retryAfterSeconds).toBe(1);
    });

    it('ウィンドウ境界ちょうどの記録は期限切れとして扱う', () => {
        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            consumeRateLimit('ip-a', T0);
        }

        // 判定は `at > now - WINDOW_MS`（排他）。ちょうど WINDOW_MS 前の記録は
        // 「直近 10 分間」から外れたものとして落とす、という仕様を固定する。
        expect(consumeRateLimit('ip-a', T0 + WINDOW_MS - 1).allowed).toBe(false);
        expect(consumeRateLimit('ip-a', T0 + WINDOW_MS).allowed).toBe(true);
    });

    it('空文字のキーでも独立して数える', () => {
        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            expect(consumeRateLimit('', T0).allowed).toBe(true);
        }
        expect(consumeRateLimit('', T0).allowed).toBe(false);
        expect(consumeRateLimit('ip-a', T0).allowed).toBe(true);
    });
});

describe('resetRateLimitStore', () => {
    // --- 正常系 ---
    it('履歴を消して再び許可されるようにする', () => {
        for (let i = 0; i < MAX_REQUESTS; i += 1) {
            consumeRateLimit('ip-a', T0);
        }
        expect(consumeRateLimit('ip-a', T0).allowed).toBe(false);

        resetRateLimitStore();

        expect(consumeRateLimit('ip-a', T0).allowed).toBe(true);
    });
});
