/**
 * E2E 全体のティアダウン。globalSetup で起動した GCS エミュレータコンテナを停止する。
 */
export default async function globalTeardown() {
    await globalThis.__E2E_GCS_CONTAINER__?.stop();
    globalThis.__E2E_GCS_CONTAINER__ = undefined;
}
