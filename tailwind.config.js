/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            /*
             * 配色は CSS 変数（issue #136 で `globals.css` に定義）を参照する。
             * 固定色をここに並べるとテーマ切替ができないため、値ではなく変数を書く。
             *
             * **透過度の修飾子（`text-ink/50` 等）は使えない。** Tailwind が
             * `rgb(var(--x) / <alpha-value>)` の形を要求するのに対し、トークンは
             * hex / oklch の完成した色だからである。濃淡が要る箇所は専用トークンを足す。
             */
            colors: {
                paper: 'var(--paper)',
                ink: 'var(--ink)',
                body: 'var(--body)',
                lead: 'var(--lead)',
                mute: 'var(--mute)',
                rule: 'var(--rule)',
                field: 'var(--field)',
                panel: 'var(--panel)',
                acc: 'var(--acc)',
                'acc-on': 'var(--acc-on)',
                warn: 'var(--warn)',
            },
            /*
             * 見出しは明朝、本文はゴシック。英語見出し（`Solving Problems with Technology`）も
             * 明朝で組む。issue #135 の検討で、現行のネオングラデーションより読みやすく
             * 品位が出ることを確認している。
             *
             * 日本語フォントは Google Fonts の unicode-range 分割に載せる（`globals.css` の
             * `@import`）。next/font は日本語のサブセット指定ができず全字形を取りに行くため使わない。
             */
            fontFamily: {
                serif: ['"Zen Old Mincho"', 'serif'],
                sans: ['"Zen Kaku Gothic New"', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
            },
            /*
             * 動きは初回表示の 1 回だけ。書類として読ませる設計に、常時動く装飾は馴染まない。
             * `prefers-reduced-motion` での無効化は `globals.css` が担う。
             */
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out both',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};
