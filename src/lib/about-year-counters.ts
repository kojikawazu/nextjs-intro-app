import { toDateString } from '@/lib/custom-date';

/** 本文中のプレースホルダ `{key}`。キーは英数字とアンダースコアに限る（和文に `{` が混ざっても誤爆しない）。 */
const PLACEHOLDER_RE = /\{([A-Za-z0-9_]+)\}/g;

/**
 * 「今」を判定するタイムゾーン。
 *
 * 本番の Cloud Run は UTC で動くため、`Date#getMonth()` をそのまま使うと JST の月初 0〜9 時に
 * 前月として数えてしまう。掲載者・閲覧者とも日本基準なので JST に固定する。
 */
const TIME_ZONE = 'Asia/Tokyo';

const MONTHS_PER_YEAR = 12;

/** 年と月（1〜12）の組。本ファイル内でのみ使う。 */
interface YearMonth {
    year: number;
    month: number;
}

/** `fillYearCounters` の戻り値。 */
export interface YearCountersResult {
    /** プレースホルダを置き換えた段落。解決できなかったプレースホルダは元の表記のまま残る */
    contents: string[];
    /** 解決できなかったキー（重複なし）。未定義・日付の形式不正のいずれか */
    unresolved: string[];
}

/**
 * `YYYY年M月` を年と月へ分解する。
 *
 * `toDateString` の正規表現は前後を固定していないため `2019年13月` も通ってしまう。
 * 月の範囲はここで別に検査する。
 *
 * @param yearMonth - 起点の年月（`YYYY年M月` 形式を想定）
 * @returns 年と月（1〜12）。解釈できなければ `null`
 */
function parseYearMonth(yearMonth: unknown): YearMonth | null {
    if (typeof yearMonth !== 'string') {
        return null;
    }
    try {
        const [year, month] = toDateString(yearMonth).split('/').map(Number);
        return month >= 1 && month <= MONTHS_PER_YEAR ? { year, month } : null;
    } catch {
        return null;
    }
}

/**
 * JST での現在の年と月を返す。
 *
 * @param now - 基準となる時刻
 * @returns JST での年と月（1〜12）
 */
function toJstYearMonth(now: Date): YearMonth {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: 'numeric',
    }).formatToParts(now);
    const pick = (type: 'year' | 'month') =>
        Number(parts.find((part) => part.type === type)?.value);

    return { year: pick('year'), month: pick('month') };
}

/**
 * 起点の年月から「◯年目」の数を求める。満年数 + 1 で、月単位で数える。
 *
 * 起点と同じ月になった時点で 1 増える（2019年1月起点なら 2026年1月から 8 年目）。
 * 起点が未来の場合は 1 年目とする。
 *
 * @param start - 起点の年と月
 * @param current - 現在の年と月（JST）
 * @returns 1 以上の「◯年目」の数
 */
function toOrdinalYear(start: YearMonth, current: YearMonth): number {
    const elapsedMonths =
        (current.year - start.year) * MONTHS_PER_YEAR + (current.month - start.month);
    return elapsedMonths < 0 ? 1 : Math.floor(elapsedMonths / MONTHS_PER_YEAR) + 1;
}

/**
 * 自己紹介文の `{key}` を、起点の年月から算出した「◯年目」の数で置き換える。
 *
 * **年数を本文に手書きしないための仕組み**（issue #198）。手書きの「6年目」は時間とともに
 * 必ず古くなり、実際に 2 年分ずれていた。文言（「年目」など）はデータ側が持ち、ここは
 * 数字だけを差し込む。
 *
 * `now` を引数で受けるのは、時刻を読む場所を呼び出し側（`page.tsx`）の 1 箇所に絞るため。
 * Client Component 内で `new Date()` を読むと、SSR と hydration で月をまたいだ場合に値がずれる。
 *
 * 未定義のキーや形式不正の日付があっても例外にしない。1 件の不正でページ全体を落とすより、
 * その箇所を元の表記のまま残す方が実害が小さい。どのキーが解決できなかったかは
 * `unresolved` で返すので、記録は呼び出し側で行う。なお GCS の JSON は実行時に未検証のため、
 * 型上は `string` でも値が文字列でない場合を想定している。
 *
 * @param contents - `about_data.about_contents`（段落ごとの配列）
 * @param counters - `about_data.about_year_counters`（キー → 起点の `YYYY年M月`）。無ければ何も置き換えない
 * @param now - 基準となる時刻。JST の年月に換算して使う
 * @returns 置き換え後の段落と、解決できなかったキー
 */
export function fillYearCounters(
    contents: readonly string[],
    counters: Readonly<Record<string, string>> | undefined,
    now: Date,
): YearCountersResult {
    const current = toJstYearMonth(now);
    const unresolved = new Set<string>();

    const filled = contents.map((paragraph) => {
        // 未検証の JSON に文字列以外が混ざっても、置き換えを足したことでページが落ちないようにする。
        // 素通しした値の扱いは従来どおり `splitAboutContents` 以降に委ねる。
        if (typeof paragraph !== 'string') {
            return paragraph;
        }
        return paragraph.replace(PLACEHOLDER_RE, (match, key: string) => {
            // `in` や `counters[key]` だと `toString` 等のプロトタイプ由来のキーを定義済みと誤認する。
            const start =
                counters && Object.prototype.hasOwnProperty.call(counters, key)
                    ? parseYearMonth(counters[key])
                    : null;
            if (!start) {
                unresolved.add(key);
                return match;
            }
            return String(toOrdinalYear(start, current));
        });
    });

    return { contents: filled, unresolved: Array.from(unresolved) };
}
