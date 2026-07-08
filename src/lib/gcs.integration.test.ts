import { describe, it, expect, inject, vi } from 'vitest';

const endpoint = inject('gcsEndpoint');
const bucket = inject('gcsBucket');
const validPath = inject('gcsValidPath');
const invalidPath = inject('gcsInvalidPath');
const missingPath = inject('gcsMissingPath');
const seededLinkTitle = inject('seededLinkTitle');

// gcs.ts はモジュールロード時に env（バケット名・パス・STORAGE_EMULATOR_HOST）を読むため、
// パスを変える各ケースで env を設定し直してから再ロードする。
async function loadGcs(jsonPath: string) {
    vi.resetModules();
    process.env.GCS_API_ENDPOINT = endpoint;
    process.env.GCS_PRIVATE_BUCKET_NAME = bucket;
    process.env.GCS_JSON_PATH = jsonPath;
    return import('@/lib/gcs');
}

describe('gcs.getPortfolioDataFromGCS（fake-gcs-server コンテナ）', () => {
    // --- 正常系 ---
    it('バケット内の正常な JSON を取得してパースする', async () => {
        const { getPortfolioDataFromGCS } = await loadGcs(validPath);
        const data = await getPortfolioDataFromGCS();
        expect(data.navbar_data.link_title).toBe(seededLinkTitle);
    });

    // --- 異常系（ファイルが存在しない）---
    it('存在しないファイルは「not found in bucket」を含むエラーを投げる', async () => {
        const { getPortfolioDataFromGCS } = await loadGcs(missingPath);
        await expect(getPortfolioDataFromGCS()).rejects.toThrow(/not found in bucket/);
    });

    // --- 準正常系（ファイルは存在するが内容が不正）---
    it('不正な JSON はパースエラーをラップして投げる', async () => {
        const { getPortfolioDataFromGCS } = await loadGcs(invalidPath);
        await expect(getPortfolioDataFromGCS()).rejects.toThrow(/Failed to fetch portfolio data/);
    });
});
