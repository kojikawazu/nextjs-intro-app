import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS のクラス名を条件付きで結合し、競合するユーティリティを解決する。
 *
 * `clsx` が条件分岐・配列・オブジェクト形式の入力を 1 本の文字列にまとめ、続く `twMerge` が
 * 同じプロパティを指すクラス（例: `px-2` と `px-4`）の衝突を**後勝ち**で解消する。
 * 素朴な文字列連結では両方が出力されて CSS の詳細度と記述順に結果が左右されるため、
 * コンポーネントの既定クラスを呼び出し側の `className` で上書きできるようにするにはこの 2 段が要る。
 *
 * @param inputs - 結合するクラス名。文字列・配列・条件付きオブジェクトを混在させてよい
 * @returns 競合を解決済みのクラス名文字列
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
