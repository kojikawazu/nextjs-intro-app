import { logWarn } from './logger';

/**
 * 本番の正規オリジン。環境変数 `SITE_URL` が未設定・不正な場合のフォールバックとして使う。
 *
 * 参照が本ファイルに閉じるため export しない（coding-standards「1 ファイルに閉じるなら定義ファイル内に置く」）。
 * ベース URL は `constants/` に置かない規約のため、集約先も設けない。
 */
const CANONICAL_SITE_URL = 'https://introtechkkplus.com';

/**
 * サイトの正規オリジンを解決する。
 *
 * 優先順位は `SITE_URL` 環境変数 → 正規オリジン。メタデータ生成中に例外を投げるとページ全体が
 * 500 になるため、URL として解釈できない値でも throw せず、警告のうえ正規オリジンへ退避する。
 *
 * 環境変数名に `NEXT_PUBLIC_` を付けないのは意図的。呼び出し元はいずれもサーバー側（メタデータ・
 * sitemap・robots）であり、`NEXT_PUBLIC_` を付けるとビルド時に値がリテラル置換されて、
 * Cloud Run の実行時環境変数では上書きできなくなる。
 *
 * @returns サイトの正規オリジンを表す URL
 */
export function getSiteUrl(): URL {
    const raw = process.env.SITE_URL?.trim();

    if (!raw) {
        return new URL(CANONICAL_SITE_URL);
    }

    try {
        return new URL(raw);
    } catch {
        logWarn(
            'site-url: SITE_URL を URL として解釈できないため正規オリジンへフォールバックする',
            {
                raw,
            },
        );
        return new URL(CANONICAL_SITE_URL);
    }
}
