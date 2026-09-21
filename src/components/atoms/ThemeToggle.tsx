'use client';

import { useTheme } from '@/hooks/useTheme';

/**
 * 配色テーマを切り替える。
 *
 * **どちらが選択中かは JS ではなく CSS が決める**（`globals.css` の `.theme-toggle-*`）。
 * サーバーは Cookie 未設定時に `data-theme` を出力せず OS 設定へ委ねるため、
 * 選択状態を React の state で持つと**初期描画時点では正解が分からず**、
 * ハイドレーション不一致か一瞬のちらつきのどちらかが必ず起きる。
 * 配色トークンと同じカスケードで見た目を決めれば、その問題自体が消える。
 *
 * **トグル 1 個ではなくボタン 2 個**にしている。1 個にすると「いまどちらか」を
 * `aria-pressed` で伝える必要があり、上と同じ理由で初期値を決められない。
 * 2 個なら各ボタンは単なる操作であり、状態属性を持たなくてよい。
 * 支援技術の利用者にとっても「切り替える」より行き先が明確になる。
 *
 * 記号（○ / ●）は装飾のため `aria-hidden` にし、読み上げは `aria-label` が担う。
 *
 * DOM と Cookie への書き込みは `useTheme`（`src/hooks/useTheme.ts`）に切り出しており、
 * このコンポーネントは描画と操作の割り当てに専念する。
 */
export function ThemeToggle() {
    const { applyTheme } = useTheme();

    return (
        <div
            role="group"
            aria-label="配色テーマ"
            className="inline-flex overflow-hidden rounded-full border border-field"
        >
            <button
                type="button"
                onClick={() => applyTheme('light')}
                aria-label="ライトテーマに切り替える"
                className="theme-toggle-light px-2 py-1 text-[10px] leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-acc"
            >
                <span aria-hidden="true">○</span>
            </button>
            <button
                type="button"
                onClick={() => applyTheme('dark')}
                aria-label="ダークテーマに切り替える"
                className="theme-toggle-dark px-2 py-1 text-[10px] leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-acc"
            >
                <span aria-hidden="true">●</span>
            </button>
        </div>
    );
}
