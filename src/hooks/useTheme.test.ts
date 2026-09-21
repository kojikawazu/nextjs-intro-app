import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
    beforeEach(() => {
        // jsdom は Cookie と <html> の属性をテスト間で持ち越すため明示的に戻す。
        document.documentElement.removeAttribute('data-theme');
        document.cookie = 'theme=; Path=/; Max-Age=0';
    });

    // --- 正常系 ---
    it('applyTheme が <html> の data-theme と Cookie の両方を更新する', () => {
        const { result } = renderHook(() => useTheme());

        act(() => result.current.applyTheme('dark'));

        expect(document.documentElement.dataset.theme).toBe('dark');
        expect(document.cookie).toContain('theme=dark');
    });

    // --- 準正常系（呼び出しパターンの違い）---
    it('呼ぶまでは data-theme を設定しない（サーバーが出した値を上書きしない）', () => {
        renderHook(() => useTheme());

        expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });

    it('続けて呼ぶと最後の値が残る', () => {
        const { result } = renderHook(() => useTheme());

        act(() => result.current.applyTheme('dark'));
        act(() => result.current.applyTheme('light'));

        expect(document.documentElement.dataset.theme).toBe('light');
        expect(document.cookie).toContain('theme=light');
    });

    it('同じ値を 2 回適用しても結果が変わらない（冪等）', () => {
        const { result } = renderHook(() => useTheme());

        act(() => result.current.applyTheme('dark'));
        act(() => result.current.applyTheme('dark'));

        expect(document.documentElement.dataset.theme).toBe('dark');
    });

    // --- 異常系（フックとしての契約）---
    it('再レンダリングしても applyTheme の参照が変わらない', () => {
        // 参照が毎回変わると、呼び出し側が useEffect の依存配列へ入れたときに
        // 再実行を誘発する。useCallback による安定化を仕様として固定する。
        const { result, rerender } = renderHook(() => useTheme());
        const first = result.current.applyTheme;

        rerender();

        expect(result.current.applyTheme).toBe(first);
    });

    it('状態を返さない（「いまどちらか」は React では持たない）', () => {
        // 初期描画時点では Cookie 未設定なら正解が決まらないため、state を持つと
        // ハイドレーション不一致かちらつきが必ず起きる。返すのは操作だけ。
        const { result } = renderHook(() => useTheme());

        expect(Object.keys(result.current)).toEqual(['applyTheme']);
    });
});
