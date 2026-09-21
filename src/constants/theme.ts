/**
 * 配色テーマを保存する Cookie 名。
 *
 * サーバー側の読み取り（`src/app/layout.tsx`）と Cookie 文字列の組み立て
 * （`src/lib/theme.ts`）の双方から参照するため、`constants/` へ集約している
 * （`coding-standards.md`「2 箇所目の参照が発生した時点で昇格」）。
 *
 * 環境によって変わらない値のため `constants/` に置いてよい（環境変数ではない）。
 */
export const THEME_COOKIE_NAME = 'theme';
