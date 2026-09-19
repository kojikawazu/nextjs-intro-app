import { Storage } from '@google-cloud/storage';
import { logDebug, logError } from '@/lib/logger';

/**
 * Storage クライアントへ渡す設定。環境ごとに持つキーが異なるため `any` で受けている。
 *
 * `@google-cloud/storage` の `StorageOptions` は認証方式ごとに排他的なキーを持ち、
 * 以下の分岐で段階的にキーを足していく書き方とは相性が悪い。型を厳密にするなら
 * 分岐ごとに完成形のオブジェクトを作る必要があり、それは本ファイルの構造変更になる。
 * 認証方式の全体像は `docs/09-architecture-specification.md` §7.3 を参照。
 */
let storageConfig: any = {};

// In production (Cloud Run), use Application Default Credentials (ADC)
if (process.env.NODE_ENV === 'production') {
    // Use ADC - no explicit credentials needed
    storageConfig = {};
} else if (process.env.NODE_ENV === 'development') {
    // Development environment
    if (
        process.env.GOOGLE_APPLICATION_CREDENTIALS &&
        process.env.GOOGLE_APPLICATION_CREDENTIALS !== ''
    ) {
        storageConfig = {
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        };
    }
    if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
        storageConfig.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    }
} else if (process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
    // Alternative: Use service account key JSON for non-GCP environments
    storageConfig = {
        credentials: {
            private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        },
    };
}

// エミュレータ／カスタムエンドポイント接続用（本番では未設定）。
// GCS_API_ENDPOINT があれば apiEndpoint を上書きする（SDK 推奨。baseUrl が `<endpoint>/storage/v1` になる）。
if (process.env.GCS_API_ENDPOINT) {
    storageConfig.apiEndpoint = process.env.GCS_API_ENDPOINT;
}

const storage = new Storage(storageConfig);

const bucketName = process.env.GCS_PRIVATE_BUCKET_NAME || 'intro_k_pri_bucket';
const jsonPath = process.env.GCS_JSON_PATH || 'json/navbar_intro.json';

/**
 * GCS のプライベートバケットからポートフォリオ JSON を取得して解析する。
 *
 * バケット名とパスは `GCS_PRIVATE_BUCKET_NAME` / `GCS_JSON_PATH` で上書きでき、
 * 未設定時は既定値（`intro_k_pri_bucket` / `json/navbar_intro.json`）を使う。
 *
 * **戻り値は `JSON.parse` の結果をそのまま返しており、スキーマ検証を通していない。**
 * `coding-standards.md` は「外部入力は `unknown` で受け、Zod で `parse` してから使う」と
 * 定めているが未対応で、GCS 上の JSON が壊れていても型エラーにならず実行時に初めて露見する。
 *
 * @returns ポートフォリオ JSON を解析した結果（検証前のため実質 `any`）
 * @throws ファイルが存在しない場合、またはダウンロード・解析に失敗した場合
 */
export async function getPortfolioDataFromGCS() {
    try {
        logDebug('gcs: 取得を開始', { bucketName, jsonPath });

        const bucket = storage.bucket(bucketName);
        const file = bucket.file(jsonPath);

        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
            // 例外は下の catch で logError される。ここで二重に出力しない。
            throw new Error(`File ${jsonPath} not found in bucket ${bucketName}`);
        }

        // Download file content
        const [content] = await file.download();
        const portfolioData = JSON.parse(content.toString());
        logDebug('gcs: 取得に成功', { bucketName, jsonPath });

        return portfolioData;
    } catch (error) {
        // bucketName / jsonPath は残す。「設定ミス」「権限不足」「ファイル欠落」の切り分けに
        // 必要で、バケットへのアクセス自体は IAM が守るため名前の露出は攻撃面にならない。
        // 一方 projectId と hasCredentials（認証情報の有無）は切り分け価値が低く、
        // 認証構成を推測する材料になるため出力しない（error-handling.md「センシティブ情報はログに含めない」）。
        logError('gcs: ポートフォリオ取得に失敗', error, { bucketName, jsonPath });
        throw new Error(
            `Failed to fetch portfolio data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
    }
}

/**
 * GCS バケットへの疎通を確認する。
 *
 * **現在どこからも呼び出されていない**（手動デバッグ用に残されている）。
 * 疎通不可を例外ではなく `false` で表現するため、呼び出し側で分岐しやすい。
 *
 * @returns バケットにアクセスできれば `true`、できなければ `false`
 */
export async function testGCSConnection() {
    try {
        const bucket = storage.bucket(bucketName);
        const [exists] = await bucket.exists();

        if (!exists) {
            throw new Error(`Bucket ${bucketName} does not exist or is not accessible`);
        }

        logDebug('gcs: バケットへの疎通を確認', { bucketName });
        return true;
    } catch (error) {
        logError('gcs: バケットへの疎通確認に失敗', error, { bucketName });
        return false;
    }
}
