import { defineConfig } from 'vitest/config';
import path from 'node:path';

// 統合テスト（IT）専用の設定。
// - Node 環境（DOM 不要。Route Handler / SDK を直接呼ぶ）
// - fake-gcs-server コンテナを globalSetup で 1 度だけ起動
// - コンテナ起動を含むため単一プロセス・長めのタイムアウト
export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.integration.test.ts'],
        globalSetup: ['./src/__tests__/integration/global-setup.ts'],
        testTimeout: 30_000,
        hookTimeout: 120_000,
        // コンテナ 1 個を共有し、env / モジュール状態の競合を避けるためファイルは直列実行する。
        fileParallelism: false,
        // Resend の実行時チェックを通すための固定環境変数（実際の送信は MSW でモック）。
        env: {
            RESEND_API_KEY: 're_it_testkey0000000000',
            RESEND_FROM_EMAIL: 'noreply@example.com',
            MY_MAIL_ADDRESS: 'owner@example.com',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
