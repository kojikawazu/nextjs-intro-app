import { NextResponse, type NextRequest } from 'next/server';

/**
 * CSP で許可する画像の取得元。
 *
 * ポートフォリオ画像の URL は GCS 上の JSON に格納されており、**ビルド時に列挙できない**
 * （運用者が自由に差し替える）。そのため個別ホストではなく `https:` 全体を許可している。
 * 画像は script として実行されないため、`script-src` を絞れていれば XSS の経路にならない。
 */
const IMAGE_SOURCES = "'self' data: blob: https:";

/**
 * リクエストごとの CSP を組み立てる。
 *
 * `script-src` は nonce と `strict-dynamic` で絞る。`strict-dynamic` を付けるとホストの
 * 許可リストは無視され、**nonce を持つスクリプトと、そこから読み込まれたスクリプトだけ**が
 * 実行される。Next.js は `Content-Security-Policy` リクエストヘッダーから nonce を読み取り、
 * 自身が出力する script タグへ自動で付与する。
 *
 * `style-src` には nonce を渡さない。nonce と `'unsafe-inline'` を併記するとブラウザは
 * `'unsafe-inline'` を無視する仕様で、Next.js が差し込むインラインスタイルが落ちるため。
 *
 * @param nonce - 本リクエスト用に発行した nonce
 * @param isDevelopment - 開発サーバー向けに緩める場合は `true`
 * @returns `Content-Security-Policy` ヘッダーの値
 */
function buildContentSecurityPolicy(nonce: string, isDevelopment: boolean): string {
    // 開発サーバーは React Refresh が eval を、HMR が WebSocket を使う。
    // 本番には持ち込まない。
    const scriptExtras = isDevelopment ? " 'unsafe-eval'" : '';
    const connectExtras = isDevelopment ? ' ws: wss:' : '';

    return [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${scriptExtras}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        `img-src ${IMAGE_SOURCES}`,
        `connect-src 'self'${connectExtras}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        'upgrade-insecure-requests',
    ].join('; ');
}

/**
 * レスポンスへ nonce ベースの CSP を付与する。
 *
 * nonce はリクエストごとに変える必要があるため、静的ヘッダーを書く `next.config.js` の
 * `headers()` では実現できず、middleware で組み立てている。
 * その他の固定ヘッダー（`X-Frame-Options` 等）は `next.config.js` 側に置く。
 *
 * @param request - 受信したリクエスト
 * @returns CSP を付与したレスポンス
 */
export function middleware(request: NextRequest) {
    // crypto.randomUUID は Edge ランタイムで利用できる。Buffer は使わない（Node 専用のため）。
    const nonce = btoa(crypto.randomUUID());
    const csp = buildContentSecurityPolicy(nonce, process.env.NODE_ENV !== 'production');

    // Next.js は「リクエストヘッダー」の CSP から nonce を取り出して script タグへ付与する。
    // レスポンスヘッダーだけでは拾われないため、両方に設定する。
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', csp);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('Content-Security-Policy', csp);

    return response;
}

/**
 * middleware を適用する経路。**動的レンダリングされる HTML ページだけを列挙する。**
 *
 * nonce ベースの CSP は「リクエストごとに HTML を生成できるページ」にしか適用できない。
 * Next.js は `Content-Security-Policy` リクエストヘッダーから nonce を読み取って script タグへ
 * 埋めるが、それはレンダリング時にしかできず、**ビルド時に固定された HTML には後から
 * nonce を差し込めない**。`strict-dynamic` はホスト許可リスト（`'self'`）を無効化するため、
 * nonce の無い静的ページに当てると**全スクリプトがブロックされる**。
 *
 * 実際、広いマッチャ（`/((?!api|_next/static|...).*)`）では静的プリレンダーされる 404 ページ
 * （`_not-found`）のスクリプトが全滅した。そのため対象を実在の動的ページに限定している。
 *
 * **ページを追加したらここにも追加すること。** 追加を忘れるとそのページに CSP が付かない。
 * この不変条件は `e2e/security.spec.ts` が検証する。
 *
 * プリフェッチ要求を除外するのは、プリフェッチしたマークアップと実描画時の nonce が
 * 食い違うのを避けるため。
 */
export const config = {
    matcher: [
        {
            // `/` は app/page.tsx（force-dynamic）。本サイトの HTML ページはこれだけ。
            source: '/',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};
