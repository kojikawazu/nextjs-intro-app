import { describe, it, expect, vi, afterEach } from 'vitest';
import { logError, logWarn, logDebug } from './logger';

/**
 * `console` の該当メソッドを差し替え、呼び出し引数を記録するスパイを張る。
 *
 * console 出力は外部 I/O にあたるため、モックしてよい対象（`testing.md`「モックは外部 I/O のみ」）。
 * ログの「書式」ではなく「出力されたか / 何を含むか」を検証する。
 *
 * @param method - 監視する console のメソッド名
 * @returns 呼び出しを記録するスパイ
 */
function spyConsole(method: 'error' | 'warn' | 'log') {
    return vi.spyOn(console, method).mockImplementation(() => {});
}

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});

describe('logError', () => {
    // --- 正常系 ---
    it('メッセージとスタックトレースを出力する', () => {
        const spy = spyConsole('error');
        const error = new Error('boom');

        logError('gcs: 取得に失敗', error);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toBe('[error] gcs: 取得に失敗');
        expect(spy.mock.calls[0][1]).toEqual({ stack: error.stack });
    });

    it('meta を渡すとスタックと併記する', () => {
        const spy = spyConsole('error');
        const error = new Error('boom');

        logError('gcs: 取得に失敗', error, { bucketName: 'b', jsonPath: 'p' });

        expect(spy.mock.calls[0][1]).toEqual({
            bucketName: 'b',
            jsonPath: 'p',
            stack: error.stack,
        });
    });

    // --- 準正常系（想定内の異常入力）---
    it('本番環境でも出力する（開発時ガードを持たない）', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const spy = spyConsole('error');

        logError('contact: メール送信に失敗', new Error('boom'));

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('error を省略した場合はメッセージのみを出力する', () => {
        const spy = spyConsole('error');

        logError('contact: メール送信に失敗');

        expect(spy.mock.calls[0]).toEqual(['[error] contact: メール送信に失敗']);
    });

    it('error を省略し meta だけ渡した場合は meta を出力する', () => {
        const spy = spyConsole('error');

        logError('resend: API がエラーを返した', undefined, { reason: 'rate limited' });

        expect(spy.mock.calls[0][1]).toEqual({ reason: 'rate limited' });
    });

    // --- 異常系（Error 以外が throw された・スタックが無い）---
    it('Error 以外が throw された場合は値を thrown として残す', () => {
        const spy = spyConsole('error');

        logError('contact: 想定外のエラー', 'just a string');

        expect(spy.mock.calls[0][1]).toEqual({ thrown: 'just a string' });
    });

    it('null が throw された場合も thrown として残す', () => {
        const spy = spyConsole('error');

        logError('contact: 想定外のエラー', null);

        expect(spy.mock.calls[0][1]).toEqual({ thrown: null });
    });

    it('stack を持たない Error は name と message へ退避する', () => {
        const spy = spyConsole('error');
        const error = new Error('boom');
        // 実行環境によっては stack が生成されない。その場合に情報を落とさないことを固定する。
        error.stack = undefined;

        logError('gcs: 取得に失敗', error);

        expect(spy.mock.calls[0][1]).toEqual({ stack: 'Error: boom' });
    });
});

describe('logWarn', () => {
    // --- 正常系 ---
    it('メッセージを出力する', () => {
        const spy = spyConsole('warn');

        logWarn('portfolio: sample.json が見つからない');

        expect(spy.mock.calls[0]).toEqual(['[warn] portfolio: sample.json が見つからない']);
    });

    // --- 準正常系 ---
    it('本番環境でも出力する', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const spy = spyConsole('warn');

        logWarn('site-url: SITE_URL を解釈できない', { raw: 'not-a-url' });

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][1]).toEqual({ raw: 'not-a-url' });
    });
});

describe('logDebug', () => {
    // --- 正常系 ---
    it('開発環境では出力する', () => {
        vi.stubEnv('NODE_ENV', 'development');
        const spy = spyConsole('log');

        logDebug('portfolio: データ取得を開始');

        expect(spy.mock.calls[0]).toEqual(['[debug] portfolio: データ取得を開始']);
    });

    // --- 準正常系・異常系（出力してはいけない環境）---
    it('本番環境では出力しない', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const spy = spyConsole('log');

        logDebug('portfolio: データ取得を開始', { bucketName: 'b' });

        expect(spy).not.toHaveBeenCalled();
    });

    it('test 環境では出力しない', () => {
        vi.stubEnv('NODE_ENV', 'test');
        const spy = spyConsole('log');

        logDebug('portfolio: データ取得を開始');

        expect(spy).not.toHaveBeenCalled();
    });

    it('NODE_ENV が未設定の場合は出力しない（既定は非出力）', () => {
        vi.stubEnv('NODE_ENV', '');
        const spy = spyConsole('log');

        logDebug('portfolio: データ取得を開始');

        expect(spy).not.toHaveBeenCalled();
    });
});
