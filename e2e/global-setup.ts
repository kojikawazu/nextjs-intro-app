import { GenericContainer, Wait, type StartedTestContainer } from 'testcontainers';
import { Storage } from '@google-cloud/storage';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const EMULATOR_PORT = 4443;
const BUCKET = 'e2e-bucket';
const JSON_PATH = 'json/portfolio.json';

declare global {
    // eslint-disable-next-line no-var
    var __E2E_GCS_CONTAINER__: StartedTestContainer | undefined;
}

/**
 * E2E 全体のセットアップ。fake-gcs-server を固定ポートで起動し、
 * 同梱のデモデータ（sample.example.json）をバケットへ投入する。
 * 起動したサーバ（next start）はこのバケットからポートフォリオを取得する。
 */
export default async function globalSetup() {
    const container = await new GenericContainer('fsouza/fake-gcs-server:latest')
        .withExposedPorts({ container: EMULATOR_PORT, host: EMULATOR_PORT })
        .withCommand(['-scheme', 'http', '-port', String(EMULATOR_PORT), '-backend', 'memory'])
        .withWaitStrategy(Wait.forListeningPorts())
        .start();

    const endpoint = `http://127.0.0.1:${EMULATOR_PORT}`;
    const portfolio = readFileSync(path.resolve(process.cwd(), 'sample.example.json'), 'utf-8');

    const storage = new Storage({ apiEndpoint: endpoint, projectId: 'e2e-test' });
    await storage.createBucket(BUCKET);
    await storage
        .bucket(BUCKET)
        .file(JSON_PATH)
        .save(portfolio, { resumable: false, contentType: 'application/json' });

    globalThis.__E2E_GCS_CONTAINER__ = container;
}
