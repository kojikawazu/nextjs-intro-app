/**
 * スライディングウィンドウ方式のレートリミット。
 *
 * **プロセス内のメモリのみで完結する。** Cloud Run は水平スケールするため、実効的な上限は
 * 「`MAX_REQUESTS` × 稼働インスタンス数」になり、インスタンスの再起動でカウントは消える。
 * 外部ストア（Redis 等）を導入すれば正確になるが、個人ポートフォリオの脅威モデル
 * （素朴な連投によるメール送信枠の消費・受信箱の氾濫）に対しては過剰と判断した。
 * 厳密な遮断が必要になった場合はエッジ（Cloudflare WAF）側へ寄せる（docs/06 §10）。
 *
 * 固定ウィンドウではなくスライディングウィンドウを使うのは、境界をまたいだ瞬間に
 * 上限の 2 倍が通ってしまう固定ウィンドウの弱点を避けるため。
 */

/** 制限を判定する時間窓（ミリ秒）。 */
const WINDOW_MS = 10 * 60 * 1000;

/** 時間窓あたりに許可するリクエスト数。 */
const MAX_REQUESTS = 5;

/**
 * 保持するキーの上限。これを超えたら期限切れのキーを掃除する。
 *
 * 掃除しないと、リクエスト元が増えるほど Map が単調増加してメモリを食い潰す。
 */
const MAX_TRACKED_KEYS = 10_000;

/** キーごとの許可時刻（ミリ秒）の履歴。 */
const requestHistory = new Map<string, number[]>();

/** レートリミットの判定結果。 */
export interface RateLimitResult {
    /** 許可する場合は `true`、上限に達している場合は `false` */
    allowed: boolean;
    /** 再試行可能になるまでの秒数。許可時は `0` */
    retryAfterSeconds: number;
}

/**
 * 期限切れのキーを Map から取り除く。
 *
 * @param windowStart - この時刻より古い履歴は期限切れとみなす
 */
function sweepExpired(windowStart: number): void {
    // tsconfig の target が ES5 のため Map を for...of で直接回せない。
    // forEach なら反復中の delete も安全（Map の仕様で保証される）。
    requestHistory.forEach((history, key) => {
        const alive = history.filter((at: number) => at > windowStart);
        if (alive.length === 0) {
            requestHistory.delete(key);
        } else {
            requestHistory.set(key, alive);
        }
    });
}

/**
 * 指定キーのリクエストを 1 件消費し、許可してよいかを判定する。
 *
 * 許可した場合のみ履歴へ記録する。拒否したリクエストを数えないのは、
 * 連打されるほど解除が遠のく（実質的な恒久ブロックになる）のを避けるため。
 *
 * @param key - 集計単位。通常はクライアント IP
 * @param now - 判定に使う現在時刻（ミリ秒）。テストから時間を制御するために差し替えられる
 * @returns 許可可否と、拒否時の再試行までの秒数
 */
export function consumeRateLimit(key: string, now: number = Date.now()): RateLimitResult {
    const windowStart = now - WINDOW_MS;
    const history = (requestHistory.get(key) ?? []).filter((at) => at > windowStart);

    if (history.length >= MAX_REQUESTS) {
        requestHistory.set(key, history);

        // 最も古い記録がウィンドウから外れれば 1 枠空く。
        const retryAfterSeconds = Math.max(1, Math.ceil((history[0] + WINDOW_MS - now) / 1000));
        return { allowed: false, retryAfterSeconds };
    }

    history.push(now);
    requestHistory.set(key, history);

    if (requestHistory.size > MAX_TRACKED_KEYS) {
        sweepExpired(windowStart);
    }

    return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * 履歴を全消去する。**テスト専用**。
 *
 * 履歴はモジュールスコープに持つためテスト間で共有されてしまう。これを消さないと、
 * 先行するテストの送信回数が後続のテストを 429 にしてしまい、失敗の原因が分かりにくくなる。
 * 本番コードから呼ばないこと。
 */
export function resetRateLimitStore(): void {
    requestHistory.clear();
}
