import { TECH_CATEGORY_BY_NAME, TECH_CATEGORY_LABELS } from '@/constants/tech-categories';
import { TECH_CATEGORIES, type TechCategory } from '@/types/tech-category';

/** 1 分類ぶんの技術一覧。 */
export interface TechGroup {
    /** 分類の識別子 */
    category: TechCategory;
    /** 画面に出す分類名 */
    label: string;
    /** その分類に属する技術名。入力に現れた順を保つ */
    items: string[];
}

/**
 * 大文字小文字を無視して引ける対応表。
 *
 * モジュール読み込み時に 1 度だけ組み立てる。データ側の表記ゆれ（`Java8` を `java8` と
 * 書いてしまう等）で分類が「その他」へ落ちるのを防ぐための保険で、
 * **同じ綴りで大文字小文字だけ違う別技術は存在しない**前提に立っている。
 */
const CATEGORY_BY_LOWERCASED_NAME = new Map<string, TechCategory>(
    Object.entries(TECH_CATEGORY_BY_NAME).map(([name, category]) => [name.toLowerCase(), category]),
);

/**
 * 技術名 1 件を分類する。対応表に無ければ `other` へ落とす。
 *
 * @param name - 前後の空白を除去済みの技術名
 * @returns 対応する分類。未登録なら `other`
 */
function categoryOf(name: string): TechCategory {
    return CATEGORY_BY_LOWERCASED_NAME.get(name.toLowerCase()) ?? 'other';
}

/**
 * 技術スタックを分類ごとにまとめる。
 *
 * `career_skill_stack` は 1 案件あたり最大 30 件がフラットに並ぶため、そのまま出すと
 * 読み手が信号とノイズを自力で分離する必要がある。分類して並べ替えることで、
 * 「何を書ける人か」が先に目に入るようにする（issue #137、背景は #135）。
 *
 * - **中身のある分類だけを返す。** 案件ごとに登場する分類が違う（最新案件には
 *   `platform` が無く、PC 基盤の案件には `testing` と `design` が無い）ため、
 *   固定の枠を並べると空の見出しが出る
 * - 分類の並びは `TECH_CATEGORIES` の定義順。分類内の並びは入力順を保つ
 * - 前後の空白は除去し、空文字は捨てる。同じ技術が重複していれば最初の 1 件だけ残す
 *   （大文字小文字違いも同一とみなす）
 *
 * @param stack - 技術名の配列（`career_skill_stack` をそのまま渡してよい）
 * @returns 中身のある分類だけを定義順に並べた配列。該当が無ければ空配列
 */
export function groupTechStack(stack: readonly string[]): TechGroup[] {
    const itemsByCategory = new Map<TechCategory, string[]>();
    const seen = new Set<string>();

    for (const raw of stack) {
        // 外部データ由来のため、想定外の型が混ざっても落ちないようにする。
        if (typeof raw !== 'string') {
            continue;
        }

        const name = raw.trim();
        if (name === '' || seen.has(name.toLowerCase())) {
            continue;
        }
        seen.add(name.toLowerCase());

        const category = categoryOf(name);
        const items = itemsByCategory.get(category);
        if (items === undefined) {
            itemsByCategory.set(category, [name]);
        } else {
            items.push(name);
        }
    }

    return TECH_CATEGORIES.filter((category) => itemsByCategory.has(category)).map((category) => ({
        category,
        label: TECH_CATEGORY_LABELS[category],
        // filter 済みなので必ず存在する。非 null 断言を避けるため既定値を置く。
        items: itemsByCategory.get(category) ?? [],
    }));
}
