import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';

// eslint-config-next は 16 系から flat config を直接エクスポートするため、
// FlatCompat による変換は不要。
//
// **eslint-config-next は 16 系を使うが、これは Next.js 16 への移行を意味しない。**
// 15.5.25 は peer で eslint ^9 を許容する一方、同梱の @next/eslint-plugin-next が
// 14.2.5 と古く、ESLint 9 で削除された context.getAncestors() を呼んで異常終了する。
// 16.3.5 は next への peer 依存を持たないため、アプリの Next.js は 15 系のまま使える。

const config = [
    // 対象外。旧 .eslintignore と next lint の既定除外に相当する。
    {
        ignores: [
            'node_modules/**',
            '.next/**',
            'out/**',
            'build/**',
            'next-env.d.ts',
            'coverage/**',
            'test-results/**',
            'playwright-report/**',
            'blob-report/**',
            '.playwright-mcp/**',
        ],
    },

    ...nextCoreWebVitals,

    // TypeScript 用のパーサとプラグイン。型情報を要するルールは使っていないため
    // projectService は有効化しない（lint が遅くなるだけで得がない）。
    //
    // `configs.base` は配列ではなく単一のオブジェクト。`recommended` 等は配列なので、
    // スプレッドの要否がキーごとに違う点に注意する。
    tseslint.configs.base,

    {
        rules: {
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
            'prefer-const': 'error',
            // prefer-const と対にする。`declare global { var ... }` はグローバル拡張の
            // 構文上 var が必須なため、その箇所だけ eslint-disable で明示させる。
            'no-var': 'error',
        },
    },

    // --- JSDoc（src 配下のみ）---
    //
    // flat config は配列を上から順に適用し、後の要素が前を上書きする。
    // レガシー config の overrides 2 段（src/** → src/**.tsx）は、
    // この順序で並べることで等価になる。順序を入れ替えると
    // .tsx の require-returns を off にする意図が消えるため注意。
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        plugins: { jsdoc },
        settings: { jsdoc: { mode: 'typescript' } },
        rules: {
            'jsdoc/no-types': 'error',
            'jsdoc/require-param': [
                'error',
                { checkDestructured: false, checkDestructuredRoots: false },
            ],
            'jsdoc/require-param-description': 'error',
            'jsdoc/check-param-names': 'error',
            'jsdoc/require-returns': 'error',
            'jsdoc/require-returns-description': 'error',
            'jsdoc/check-alignment': 'warn',
            'jsdoc/no-multi-asterisks': 'warn',
            'jsdoc/require-jsdoc': [
                'error',
                {
                    publicOnly: true,
                    require: { FunctionDeclaration: false },
                    contexts: [
                        'FunctionDeclaration',
                        'TSInterfaceDeclaration',
                        'TSTypeAliasDeclaration',
                        'VariableDeclaration',
                    ],
                },
            ],
        },
    },

    // JSX を返す要素に「@returns …の要素」を書くのはノイズになるため、
    // .tsx では @returns を必須にしない（.ts では必須のまま）。
    {
        files: ['src/**/*.tsx'],
        rules: {
            'jsdoc/require-returns': 'off',
            'jsdoc/require-returns-description': 'off',
        },
    },
];

export default config;
