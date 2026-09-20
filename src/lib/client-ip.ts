/**
 * リクエストヘッダーからクライアント IP を解決する。
 *
 * レートリミットのキーに使う。**どのヘッダーを信じるかは実行環境の形に依存する**ため、
 * 本サイトの構成（Cloudflare → Cloud Run）を前提に次の優先順位で決める。
 *
 * 1. `CF-Connecting-IP` — Cloudflare がプロキシしている場合に付与される。Cloudflare が
 *    実際の接続元を書くため信頼できる。
 * 2. `X-Forwarded-For` の**右端** — Cloud Run のインフラが実際の接続元を**末尾に追記**する。
 *    クライアントが `X-Forwarded-For: 1.2.3.4` を詐称して送っても `1.2.3.4, <実IP>` となり、
 *    右端を採れば申告値は無視される。左端を採ると詐称し放題になるため採らない。
 *
 * Cloudflare がプロキシしている場合、右端は Cloudflare の IP になってしまうが、
 * その状況では必ず 1. が先に拾えるため衝突しない。
 *
 * **限界**: Cloudflare を経由せず Cloud Run の URL を直接叩かれた場合、`CF-Connecting-IP` は
 * 攻撃者が自由に付けられる。確実な遮断はエッジ（Cloudflare WAF）側の責務であり、
 * 本関数と `rate-limit.ts` が担うのは「素朴な連投を止める」ところまで（docs/06 §10）。
 *
 * @param headers - 受信したリクエストのヘッダー
 * @returns 解決できた IP 文字列。どちらのヘッダーも無い場合は `null`
 */
export function resolveClientIp(headers: Headers): string | null {
    const cloudflareIp = headers.get('cf-connecting-ip')?.trim();
    if (cloudflareIp) {
        return cloudflareIp;
    }

    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        const entries = forwardedFor
            .split(',')
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0);

        // 末尾＝インフラが追記した値。先頭はクライアントが詐称できる。
        const nearest = entries[entries.length - 1];
        if (nearest) {
            return nearest;
        }
    }

    return null;
}
