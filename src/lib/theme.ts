import { THEME_COOKIE_NAME } from '@/constants/theme';
import { THEMES, type Theme } from '@/types/theme';

/**
 * テーマ Cookie の保持期間（秒）。1 年。
 *
 * セッション Cookie にすると「タブを閉じたら設定が消える」挙動になり、
 * 明示的に選んだ設定としては短すぎるため期限付きにしている。
 */
const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Cookie から読み取った生の文字列を `Theme` として解釈する。
 *
 * Cookie は利用者が自由に書き換えられる**外部入力**なので、想定外の値は例外にせず
 * `null` を返して「未選択」と同じ扱いにする。テーマの取り違えは表示が変わるだけで
 * 実害がなく、ここで失敗させるとページ全体が描画できなくなるため。
 *
 * @param raw - Cookie の値。未設定なら `undefined`
 * @returns 解釈できたテーマ。未設定・不正値の場合は `null`（OS 設定に委ねる）
 */
export function parseTheme(raw: string | undefined): Theme | null {
    if (raw === undefined) {
        return null;
    }

    // `includes` の引数は `Theme` に絞られているため、ここで `string` を渡すには
    // 一段広い型として扱う必要がある。値の実体は変わらないので実行時は安全。
    const known: readonly string[] = THEMES;

    return known.includes(raw) ? (raw as Theme) : null;
}

/**
 * `document.cookie` へ代入する文字列を組み立てる。
 *
 * 代入自体は DOM を触るためこの関数では行わず、文字列の組み立てだけを担う。
 * こうすることで Cookie の属性（有効期間・パス・SameSite）を jsdom なしで検証できる。
 *
 * `Secure` を付けていないのは、テーマ設定が秘匿情報ではない一方、
 * HTTPS でないオリジン（ローカル開発・E2E の `http://localhost`）では
 * **書き込みが黙って失敗し「切り替えても保存されない」という分かりにくい不具合になる**ため。
 * 本番の HTTPS 強制は HSTS と CSP の `upgrade-insecure-requests` が担っている。
 *
 * `SameSite=Lax` は、他サイトからの遷移でも設定を維持しつつ、
 * クロスサイトの POST に Cookie を送らないという既定の安全側の挙動を明示するもの。
 *
 * @param theme - 保存するテーマ
 * @returns `document.cookie` に代入する文字列
 */
export function serializeThemeCookie(theme: Theme): string {
    return `${THEME_COOKIE_NAME}=${theme}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}
