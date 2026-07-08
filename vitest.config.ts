import { defineConfig } from 'vitest/config';
import path from 'node:path';

// NOTE: @vitejs/plugin-react は導入していない。
// 現状はユーティリティ（純粋関数）の UT のみで JSX 変換が不要なため。
// React コンポーネントテストを追加する際に、TypeScript 5.5 互換の JSX 設定を別途整える。
export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/__tests__/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', '.next', 'e2e'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/*.d.ts', 'src/**/*.{test,spec}.{ts,tsx}', 'src/__tests__/**'],
            // NOTE: カバレッジ閾値（statements 80% 等）は docs/08 の目標値。
            // 現状はユーティリティのみのため未設定。テスト拡充に合わせて後日有効化する。
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
