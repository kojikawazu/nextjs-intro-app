import { describe, it, expect, inject, vi } from 'vitest';

const endpoint = inject('gcsEndpoint');
const bucket = inject('gcsBucket');
const validPath = inject('gcsValidPath');
const missingPath = inject('gcsMissingPath');
const seededLinkTitle = inject('seededLinkTitle');

// route → data-server → gcs はいずれもロード時に env を読むため、
// env を設定し直してから route を再ロードする。
async function loadRoute(jsonPath: string) {
    vi.resetModules();
    process.env.GCS_API_ENDPOINT = endpoint;
    process.env.GCS_PRIVATE_BUCKET_NAME = bucket;
    process.env.GCS_JSON_PATH = jsonPath;
    return import('@/app/api/portfolio/route');
}

describe('GET /api/portfolio（route → data-server → gcs コンテナ）', () => {
    // --- 正常系 ---
    it('200 でポートフォリオを返し Cache-Control を付与する', async () => {
        const { GET } = await loadRoute(validPath);
        const res = await GET();

        expect(res.status).toBe(200);
        expect(res.headers.get('Cache-Control')).toBe(
            'public, s-maxage=300, stale-while-revalidate=86400',
        );

        const body = await res.json();
        expect(body.navbar_data.link_title).toBe(seededLinkTitle);
    });

    // --- 異常系（GCS 取得失敗）---
    it('GCS 取得失敗時は 500 とエラーボディを返す', async () => {
        const { GET } = await loadRoute(missingPath);
        const res = await GET();

        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe('ポートフォリオデータの取得に失敗しました');

        // 内部エラーの詳細（旧 `details` / `timestamp`）を返さないことを固定する。
        // 原因はサーバーログ（lib/logger.ts）にのみ残す（error-handling.md）。
        expect(Object.keys(body)).toEqual(['error']);
    });
});
