import { toDateString } from '@/lib/custom-date';

/**
 * 経歴の開始・終了年月を表示用の期間文字列に整形する。
 *
 * `career_end` が `'now'` の場合は在籍中を意味するため、終了年月の代わりに「現在」を出す。
 * `'now'` は `new Date()` として解釈されるが、その値は表示に使われないため月跨ぎの影響はない。
 *
 * **もとは `client.tsx` の private 関数だった**（issue #153 で切り出し）。コンポーネントの
 * 内部にあったためユニットテストが当たらず、E2E 経由でしか踏まれていなかった。
 *
 * @param start - 開始年月（`YYYY年MM月` 形式）
 * @param end - 終了年月（`YYYY年MM月` 形式）、または在籍中を表す `'now'`
 * @returns `2023年4月 - 2024年3月` のような期間文字列。在籍中は `2023年4月 - 現在`
 * @throws {Error} `start` / `end` が `YYYY年M月` 形式として解釈できない場合（`toDateString` が投げる）
 */
export function formatCareerPeriod(start: string, end: string): string {
    const startDate = new Date(toDateString(start));
    const endDate = end === 'now' ? new Date() : new Date(toDateString(end));

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;

    if (end === 'now') {
        return `${startYear}年${startMonth}月 - 現在`;
    }

    return `${startYear}年${startMonth}月 - ${endYear}年${endMonth}月`;
}
