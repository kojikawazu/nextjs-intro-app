/**
 * 技術スタックの分類。**表示順どおりに並べる。**
 *
 * `career_skill_stack` は 1 案件あたり最大 30 件がフラットに並ぶため、読み手が
 * 信号（言語・フレームワーク・テスト）とノイズ（協働ツール）を自力で分離しなければならない。
 * この分類はその分離を担う（issue #137、背景は #135）。
 *
 * 並び順は「その人が何を書けるか」に近いものから遠いものへ。最後の `other` は
 * 対応表に無い技術の受け皿で、**分類の抜けが画面に出て気づける**ようにするための枠。
 * 隠して握りつぶすと、新技術が追加されたときに永久に気づけない。
 *
 * union の元になる定数を型と同じファイルに置いているのは、`constants/` と `types/` に
 * 分けると値と型が往復参照になり片方だけ更新される事故が起きるため
 * （`coding-standards.md`「union リテラルの元になる定数は types/ に同居させる」）。
 */
export const TECH_CATEGORIES = [
    'language',
    'framework',
    'platform',
    'testing',
    'infrastructure',
    'ai',
    'design',
    'collaboration',
    'other',
] as const;

/** 技術スタックの分類。値は `TECH_CATEGORIES` の要素。 */
export type TechCategory = (typeof TECH_CATEGORIES)[number];
