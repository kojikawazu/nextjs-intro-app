'use client';

import { useCallback } from 'react';
import { serializeThemeCookie } from '@/lib/theme';
import type { Theme } from '@/types/theme';

/**
 * 配色テーマの切り替え操作を提供する。
 *
 * `frontend.md`「クライアントコンポーネントのロジックはカスタムフックに切り出す」に従い、
 * `ThemeToggle` から DOM と Cookie への書き込みを分離したもの。
 *
 * **状態を返さない。** 「いまどちらのテーマか」は React では持たない。サーバーは Cookie
 * 未設定時に `data-theme` を出力せず OS 設定へ委ねるため、初期描画の時点では正解が
 * 決まっておらず、state に持つとハイドレーション不一致か一瞬のちらつきが必ず起きる。
 * 選択中かどうかの表示は `globals.css` の `.theme-toggle-*` が同じカスケードで決める。
 *
 * @returns テーマ切り替え操作をまとめたオブジェクト
 */
export function useTheme(): { applyTheme: (theme: Theme) => void } {
    /**
     * テーマを即座に適用し、次回以降のために Cookie へ保存する。
     *
     * `document.documentElement` を直接触るのは、React の再描画を待たずに切り替えるため。
     * Cookie はサーバー側の初期描画（`src/app/layout.tsx`）が読む。
     *
     * 依存が無いため参照は常に同一。呼び出し側が `useEffect` の依存配列へ入れても
     * 再実行を誘発しない。
     */
    const applyTheme = useCallback((theme: Theme) => {
        document.documentElement.dataset.theme = theme;
        document.cookie = serializeThemeCookie(theme);
    }, []);

    return { applyTheme };
}
