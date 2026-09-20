/**
 * 全レスポンスへ付与する固定のセキュリティヘッダー。
 *
 * リクエストごとに変わる値を持たないものだけをここに置く。`Content-Security-Policy` は
 * nonce をリクエスト単位で発行する必要があるため `src/middleware.ts` が担当する。
 */
const securityHeaders = [
    {
        // 宣言された Content-Type と異なる解釈（例: text/plain を script として実行）を止める。
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        // クリックジャッキング対策。CSP の frame-ancestors と重複するが、
        // 古いブラウザは frame-ancestors を解釈しないため両方を出す。
        key: 'X-Frame-Options',
        value: 'DENY',
    },
    {
        // 他サイトへ遷移する際に、パスやクエリを含む URL 全体を送らない。
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    {
        // 本サイトは一切使わない機能なので明示的に無効化する。
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=()',
    },
    {
        // HTTPS を強制する。preload は一度登録すると解除が難しいため付けない。
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
    },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
        ];
    },
    // Next.js 15 で experimental から昇格した（`experimental.typedRoutes` は非推奨警告になる）。
    typedRoutes: true,
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Exclude Node.js modules from client-side bundle
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                url: false,
                zlib: false,
                http: false,
                https: false,
                assert: false,
                os: false,
                path: false,
                child_process: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
