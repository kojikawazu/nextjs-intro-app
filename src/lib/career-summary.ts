import { toDateString } from '@/lib/custom-date';
import type { CareerData } from '@/types/portfolio';

/** 経歴全体から算出した要約。Hero の数値帯に出す。 */
export interface CareerSummary {
    /** 担当したプロジェクトの件数 */
    projectCount: number;
    /** 使用技術のユニーク件数（大文字小文字と前後の空白は無視して数える） */
    technologyCount: number;
    /** 最も古い案件の開始年。解析できる開始年月が 1 つも無ければ `null` */
    startYear: number | null;
}

/**
 * 経歴データから要約の数値を算出する。
 *
 * **文字列としてハードコードせず、必ずデータから数える。** 案件や技術が増えたときに
 * 数値だけ古いまま残ると、採用担当者に見せる情報として最も質が悪い種類の誤りになる。
 *
 * 解析できない `career_start` は開始年の算出から除外する。1 件の表記ゆれでページ全体を
 * 落とすより、その 1 件を数えない方が実害が小さいため（`toDateString` は不正な形式で
 * 例外を投げる）。件数と技術数はこの影響を受けない。
 *
 * @param careers - 経歴データの配列
 * @returns 件数・ユニーク技術数・最古の開始年
 */
export function summarizeCareers(careers: readonly CareerData[]): CareerSummary {
    const technologies = new Set<string>();
    const years: number[] = [];

    for (const career of careers) {
        for (const raw of career.career_skill_stack ?? []) {
            if (typeof raw !== 'string') {
                continue;
            }
            const name = raw.trim();
            if (name !== '') {
                technologies.add(name.toLowerCase());
            }
        }

        try {
            const year = Number(toDateString(career.career_start).slice(0, 4));
            if (Number.isFinite(year)) {
                years.push(year);
            }
        } catch {
            // 表記ゆれの 1 件は数えない。理由は関数コメントを参照。
        }
    }

    return {
        projectCount: careers.length,
        technologyCount: technologies.size,
        startYear: years.length > 0 ? Math.min(...years) : null,
    };
}
