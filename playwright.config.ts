import { defineConfig, devices } from '@playwright/test';

// GCS エミュレータは固定ポートで起動し、webServer(env) から静的に参照できるようにする。
const GCS_EMULATOR_PORT = 4443;

// 正常系サーバと異常系サーバをポートで分ける。
// 異常系は GCS 上に存在しないパスを向けることで、サーバー側のデータ取得を実際に失敗させる。
// page.tsx がサーバー側で取得するようになったため、ブラウザで /api/portfolio をスタブしても
// ページの描画には影響しなくなった（サーバーの取得はブラウザを経由しないため）。
const APP_PORT = 3000;
const APP_ERROR_PORT = 3001;

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
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            testIgnore: '**/error.spec.ts',
            use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${APP_PORT}` },
        },
        {
            name: 'chromium-error',
            testMatch: '**/error.spec.ts',
            use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${APP_ERROR_PORT}` },
        },
    ],
    // 本番ビルドのサーバを GCS エミュレータへ向けて起動する（要 `pnpm build` 済み）。
    webServer: [
        {
            command: `pnpm exec next start -p ${APP_PORT}`,
            // 起動確認は GCS に依存しない静的ルートで行う。`/` はサーバー側で GCS を叩くため、
            // globalSetup（エミュレータ起動）より先に走るヘルスチェックでは必ず失敗する。
            url: `http://127.0.0.1:${APP_PORT}/robots.txt`,
            timeout: 120_000,
            reuseExistingServer: !process.env.CI,
            env: {
                GCS_API_ENDPOINT: `http://127.0.0.1:${GCS_EMULATOR_PORT}`,
                GCS_PRIVATE_BUCKET_NAME: 'e2e-bucket',
                GCS_JSON_PATH: 'json/portfolio.json',
                // メタデータ検証（seo.spec.ts）を開発者の .env.local に左右されないよう固定する。
                // `next start` は本番モードでも .env.local を読むため、明示しないと期待値がぶれる。
                SITE_URL: 'https://introtechkkplus.com',
            },
        },
        {
            // 異常系専用。存在しないオブジェクトを指すため、サーバー側の取得が必ず失敗し
            // error.tsx のエラーバウンダリが描画される。
            command: `pnpm exec next start -p ${APP_ERROR_PORT}`,
            // 同上。加えてこのサーバは `/` が常に失敗する設定のため、静的ルートでの確認が必須。
            url: `http://127.0.0.1:${APP_ERROR_PORT}/robots.txt`,
            timeout: 120_000,
            reuseExistingServer: !process.env.CI,
            env: {
                GCS_API_ENDPOINT: `http://127.0.0.1:${GCS_EMULATOR_PORT}`,
                GCS_PRIVATE_BUCKET_NAME: 'e2e-bucket',
                GCS_JSON_PATH: 'json/does-not-exist.json',
                SITE_URL: 'https://introtechkkplus.com',
            },
        },
    ],
});
