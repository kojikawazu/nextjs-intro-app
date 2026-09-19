/**
 * ログ出力の方針を集約するユーティリティ。
 *
 * 従来は「本番でも無条件に出力する箇所」と「`NODE_ENV === 'development'` で
 * 握りつぶす箇所」が混在し、本番で調査に必要なエラーが残らない一方で、
 * 進行状況ログだけが出続けていた。方針をここへ寄せ、呼び出し側は
 * 「エラーか / 警告か / デバッグ情報か」だけを選べばよい形にする。
 *
 * | 関数 | 出力条件 | 用途 |
 * |---|---|---|
 * | `logError` | 常時 | 失敗の記録。スタックトレースを必ず残す |
 * | `logWarn` | 常時 | 処理は継続できるが注意が要る事象 |
 * | `logDebug` | 開発時のみ | 進行状況の追跡 |
 *
 * **`meta` に何を渡すかは呼び出し側の責任**。`error-handling.md`「センシティブ情報は
 * ログに含めない」に従い、認証情報・個人情報・トークンを渡さないこと。
 * 本モジュールは自動のマスキングを行わない。
 */

/** ログ 1 行に添える補足情報。値は `console` がそのまま出力する。 */
type LogMeta = Record<string, unknown>;

/**
 * 開発環境で動作しているかを判定する。
 *
 * **モジュールのトップレベルで束縛せず、呼び出しのたびに評価する。** 定数に固定すると
 * import 時点の値で決まってしまい、テストが環境を差し替えても挙動を切り替えられない。
 *
 * @returns `NODE_ENV` が `development` なら `true`
 */
function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
}

/**
 * `console` へ渡す補足情報を組み立てる。
 *
 * @param meta - 呼び出し側が添える補足情報
 * @param error - 捕捉した例外。`Error` ならスタックトレース、それ以外は値そのものを残す
 * @returns 出力すべき情報が 1 つもなければ `undefined`
 */
function buildDetail(meta?: LogMeta, error?: unknown): LogMeta | undefined {
    const detail: LogMeta = { ...meta };

    if (error instanceof Error) {
        // stack は環境によって undefined になり得るため、最低限の識別情報へ退避する。
        detail.stack = error.stack ?? `${error.name}: ${error.message}`;
    } else if (error !== undefined) {
        // Error 以外が throw された場合。値を落とすと原因が追えなくなるため残す。
        detail.thrown = error;
    }

    return Object.keys(detail).length > 0 ? detail : undefined;
}

/**
 * 失敗を記録する。本番環境でも必ず出力する。
 *
 * `error-handling.md`「エラー時はスタックトレースを含むログを出力する」に対応する。
 *
 * @param message - 何に失敗したかを表す固定文言。可変値は `meta` へ回す
 * @param error - 捕捉した例外。省略可
 * @param meta - 切り分けに必要な補足情報。センシティブ情報を含めないこと
 */
export function logError(message: string, error?: unknown, meta?: LogMeta): void {
    const detail = buildDetail(meta, error);
    if (detail) {
        console.error(`[error] ${message}`, detail);
    } else {
        console.error(`[error] ${message}`);
    }
}

/**
 * 処理は継続できるが注意が要る事象を記録する。本番環境でも出力する。
 *
 * @param message - 事象を表す固定文言
 * @param meta - 補足情報。センシティブ情報を含めないこと
 */
export function logWarn(message: string, meta?: LogMeta): void {
    const detail = buildDetail(meta);
    if (detail) {
        console.warn(`[warn] ${message}`, detail);
    } else {
        console.warn(`[warn] ${message}`);
    }
}

/**
 * 進行状況を記録する。**開発環境でのみ出力**し、本番では何もしない。
 *
 * 本番のログを埋めても調査の役に立たない類の情報（「取得を開始した」等）を対象とする。
 *
 * @param message - 進行状況を表す文言
 * @param meta - 補足情報。センシティブ情報を含めないこと
 */
export function logDebug(message: string, meta?: LogMeta): void {
    if (!isDevelopment()) {
        return;
    }

    const detail = buildDetail(meta);
    if (detail) {
        console.log(`[debug] ${message}`, detail);
    } else {
        console.log(`[debug] ${message}`);
    }
}
