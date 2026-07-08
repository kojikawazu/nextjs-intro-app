import { defineConfig, devices } from '@playwright/test';

// GCS エミュレータは固定ポートで起動し、webServer(env) から静的に参照できるようにする。
const GCS_EMULATOR_PORT = 4443;

export default defineConfig({
    testDir: './e2e',
    testMatch: '**/*.spec.ts',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    // flaky 対応: CI ではリトライし、失敗時のみ trace / screenshot / video を保存する。
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    timeout: 30_000,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
    globalSetup: './e2e/global-setup.ts',
    globalTeardown: './e2e/global-teardown.ts',
    use: {
        baseURL: 'http://127.0.0.1:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    // 本番ビルドのサーバを GCS エミュレータへ向けて起動する（要 `pnpm build` 済み）。
    webServer: {
        command: 'pnpm start',
        url: 'http://127.0.0.1:3000',
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
        env: {
            GCS_API_ENDPOINT: `http://127.0.0.1:${GCS_EMULATOR_PORT}`,
            GCS_PRIVATE_BUCKET_NAME: 'e2e-bucket',
            GCS_JSON_PATH: 'json/portfolio.json',
        },
    },
});
