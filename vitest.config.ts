import { defineConfig } from 'vitest/config';
import path from 'node:path';

// React コンポーネントテスト（.tsx）を動かすための JSX 変換設定。
//
// tsconfig の jsx は "preserve"（変換は Next.js のビルドが担うため）。Vite はこの設定を
// 尊重して JSX を素通しするので、テスト実行時だけ明示的に変換を指示する必要がある。
//
// **Vite 8 のトランスフォーマは esbuild ではなく oxc。** そのため広く案内されている
// `esbuild: { jsx }` や @vitejs/plugin-react は効かない（前者は無視され、後者も内部で
// esbuild オプションを設定するため同じ）。oxc へ直接指示すればプラグインは不要。
export default defineConfig({
    oxc: { jsx: { runtime: 'automatic' } },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/__tests__/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        // 統合テスト（*.integration.test.ts）は別設定（vitest.integration.config.ts）で実行するため除外。
        exclude: ['node_modules', '.next', 'e2e', 'src/**/*.integration.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/*.d.ts', 'src/**/*.{test,spec}.{ts,tsx}', 'src/__tests__/**'],
            // NOTE: カバレッジ閾値（statements 80% 等）は docs/08 の目標値。
            // コンポーネントテストは 2 / 9 件（docs/11 タスク #30）で途上のため未設定。
            // 拡充に合わせて後日有効化する（docs/11 タスク #52）。
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
