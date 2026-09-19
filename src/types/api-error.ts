/**
 * Route Handler がエラー時に返す統一レスポンスボディ。
 *
 * 全エンドポイントでこの形に揃える（`error-handling.md`「統一エラーレスポンス」）。
 * 従来 `GET /api/portfolio` だけが `details`（`Error.message`）と `timestamp` を
 * 併せて返していたが、`details` は内部エラーの露出にあたるため廃止した。
 * 調査に必要な情報はレスポンスではなくサーバーログ（`lib/logger.ts`）へ残す。
 */
export interface ApiErrorResponse {
    /**
     * 利用者へ提示するエラーメッセージ。
     *
     * 内部例外の `message` やスタックトレースを載せないこと。原因の粒度ではなく、
     * 「利用者が次に何をすればよいか」が伝わる固定文言を使う。
     */
    error: string;
}
