/**
 * 利用者が明示的に選択できる配色テーマの一覧。
 *
 * 値はそのまま `data-theme` 属性と Cookie に入るため、`globals.css` の
 * `[data-theme='light']` / `[data-theme='dark']` と 1 対 1 で対応する。
 * どちらかを変える場合は CSS 側も同時に変えること。
 *
 * union の元になる定数を型と同じファイルに置いているのは、`constants/` と `types/` に
 * 分けると値と型が往復参照になり片方だけ更新される事故が起きるため
 * （`coding-standards.md`「union リテラルの元になる定数は types/ に同居させる」）。
 */
export const THEMES = ['light', 'dark'] as const;

/**
 * 配色テーマ。
 *
 * 「利用者が選んでいない」状態はこの型では表さず、呼び出し側が `null` で表現する。
 * 未選択時は `data-theme` を出力せず、OS の `prefers-color-scheme` に委ねるため。
 */
export type Theme = (typeof THEMES)[number];
