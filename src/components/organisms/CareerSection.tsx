import { CareerCard } from '@/components/molecules/CareerCard';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { formatCareerPeriod } from '@/lib/career-period';
import type { CareerData } from '@/types/portfolio';

/** `CareerSection` の props。 */
export interface CareerSectionProps {
    /** セクション見出し（`navbar_data.career_name`） */
    title: string;
    /** 経歴一覧。**配列の並びがそのまま表示順**になる */
    careers: CareerData[];
}

/**
 * 経歴セクション。`CareerCard` を縦に並べる。
 *
 * **並べ替えはしない。** GCS 側のデータが「主プロジェクト → その関連・兼任プロジェクト」で
 * グルーピングされており、厳密な時系列降順ではない。日付で並べ替えると意図した並びが崩れる
 * （データ側リポジトリの `data-json.md` を参照）。
 *
 * 進行中かどうかは `career_end === 'now'` で判定し、`CareerCard` の左罫の色と「現在」バッジに
 * 反映する。**この判定をカード側に持たせない**のは、`'now'` という表現が GCS のデータ形式に
 * 属する約束であり、表示部品が知るべきことではないため。
 *
 * 説明文はハードコードしている。GCS の `career_title_data` は列ラベルの定義であって
 * セクションの説明文ではない。
 */
export function CareerSection({ title, careers }: CareerSectionProps) {
    return (
        <section id="career" className="container section-padding">
            <SectionHeading title={title} count={careers.length} />
            <p className="mb-8 text-xs text-mute">これまでの経歴・実績</p>

            <div className="flex flex-col gap-10">
                {careers.map((career, index) => (
                    <CareerCard
                        key={index}
                        title={career.career_title}
                        period={formatCareerPeriod(career.career_start, career.career_end)}
                        teamSize={career.career_member}
                        description={career.career_contents}
                        techStack={career.career_skill_stack}
                        phases={career.career_skill_phase}
                        role={career.career_role}
                        isCurrent={career.career_end === 'now'}
                    />
                ))}
            </div>
        </section>
    );
}
