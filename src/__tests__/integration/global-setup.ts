import { GenericContainer, Wait, type StartedTestContainer } from 'testcontainers';
import { Storage } from '@google-cloud/storage';
import type { ProvidedContext } from 'vitest';

// vitest 4 の globalSetup コンテキスト（provide のみ利用）。
type GlobalSetupContext = {
    provide: <K extends keyof ProvidedContext>(key: K, value: ProvidedContext[K]) => void;
};

// IT 全体で共有する固定値（テスト側は inject で受け取る）。
const BUCKET = 'it-portfolio-bucket';
const VALID_PATH = 'json/valid.json';
const INVALID_PATH = 'json/invalid.json';
const MISSING_PATH = 'json/does-not-exist.json';

// GCS に配置する代表的なポートフォリオ JSON。
// route/gcs はスキーマ検証をしないため、取得・パースの確認に足る最小構造とする。
const seededPortfolio = {
    navbar_data: {
        link_title: 'IT-Portfolio',
        about_name: 'About',
        career_name: 'Career',
        skills_name: 'Skills',
        contact_name: 'Contact',
    },
    footer_data: { copyright: '(C) IT Test' },
};

// vitest の inject に型を通すためのコンテキスト拡張。
declare module 'vitest' {
    export interface ProvidedContext {
        gcsEndpoint: string;
        gcsBucket: string;
        gcsValidPath: string;
        gcsInvalidPath: string;
        gcsMissingPath: string;
        seededLinkTitle: string;
    }
}

let container: StartedTestContainer | undefined;

/**
 * IT スイート全体で 1 度だけ実行するセットアップ。
 * fake-gcs-server コンテナを起動し、バケットへ正常/不正の 2 種の JSON を投入する。
 *
 * @param ctx - vitest のグローバルセットアップコンテキスト（`provide` を含む）
 * @returns スイート終了時にコンテナを停止するティアダウン関数
 */
export default async function setup(ctx: GlobalSetupContext) {
    const { provide } = ctx;
    container = await new GenericContainer('fsouza/fake-gcs-server:latest')
        .withExposedPorts(4443)
        .withCommand(['-scheme', 'http', '-port', '4443', '-backend', 'memory'])
        .withWaitStrategy(Wait.forListeningPorts())
        .start();

    const endpoint = `http://${container.getHost()}:${container.getMappedPort(4443)}`;

    // エミュレータへバケットと 2 種のオブジェクトを投入する（resumable は external-url 依存のため無効化）。
    const storage = new Storage({ apiEndpoint: endpoint, projectId: 'it-test' });
    await storage.createBucket(BUCKET);
    const bucket = storage.bucket(BUCKET);
    await bucket.file(VALID_PATH).save(JSON.stringify(seededPortfolio), {
        resumable: false,
        contentType: 'application/json',
    });
    await bucket
        .file(INVALID_PATH)
        .save('{ this is not valid json', { resumable: false, contentType: 'application/json' });

    provide('gcsEndpoint', endpoint);
    provide('gcsBucket', BUCKET);
    provide('gcsValidPath', VALID_PATH);
    provide('gcsInvalidPath', INVALID_PATH);
    provide('gcsMissingPath', MISSING_PATH);
    provide('seededLinkTitle', seededPortfolio.navbar_data.link_title);

    return async () => {
        await container?.stop();
    };
}
