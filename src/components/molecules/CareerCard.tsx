import { Badge } from '@/components/atoms/Badge';
import { groupTechStack } from '@/lib/group-tech-stack';
import { cn } from '@/utils/cn';

/** `CareerCard` の props。 */
export interface CareerCardProps {
    /** プロジェクト名 / 案件タイトル */
    title: string;
    /** 表示用に整形済みの期間文字列。整形は呼び出し側（`client.tsx` の `formatCareerPeriod`）が行う */
    period: string;
    /** チーム人数（例: `5名`） */
    teamSize: string;
    /** 業務内容の説明 */
    description: string;
    /** 使用技術一覧。分類ごとにまとめて表示する */
    techStack: string[];
    /** 担当フェーズ一覧 */
    phases: string[];
    /** プロジェクトでの役割 */
    role: string;
    /**
     * 進行中の案件かどうか。既定は `false`。
     * `true` のとき左罫をアクセント色にし、タイトル横に「現在」を出す。
     * 呼び出し側は `career_end === 'now'` から判定している。
     */
    isCurrent?: boolean;
    /** 追加クラス */
    className?: string;
}

/**
 * 経歴 1 件分。
 *
 * **技術スタックを分類ごとにまとめて出す**（issue #137 の `groupTechStack`）。
 * 1 案件あたり最大 30 件をフラットに並べると、読み手が信号（言語・フレームワーク・テスト）と
 * ノイズ（協働ツール）を自力で分離しなければならなかった。
 *
 * **進行中と過去で重みを変える。** 進行中は左罫をアクセント色にして「現在」を添え、
 * 過去は地の罫線色へ落とす。全 7 件が等価に並ぶと直近の案件と 2015 年の業務が
 * 同じ重さで読まれてしまう（issue #135 の弱点(4)）。
 *
 * 各項目のラベル（「技術スタック」「担当フェーズ」「役割」）は**ハードコードされており**、
 * GCS の `career_title_data` は参照していない。詳細は `docs/05-data-specification.md` §2.6。
 */
export function CareerCard({
    title,
    period,
    teamSize,
    description,
    techStack,
    phases,
    role,
    isCurrent = false,
    className,
}: CareerCardProps) {
    const techGroups = groupTechStack(techStack);

    return (
        <article
            className={cn('border-l-2 pl-5', isCurrent ? 'border-acc' : 'border-rule', className)}
        >
            <div className="mb-2 flex flex-wrap items-baseline gap-3">
                <h3 className="text-base font-bold leading-relaxed text-ink">{title}</h3>
                {isCurrent && <Badge>現在</Badge>}
            </div>

            <p className="mb-4 font-mono text-xs text-mute">
                {period} ・ {teamSize}
            </p>

            <p className="mb-6 text-[13px] leading-loose text-body">{description}</p>

            {techGroups.length > 0 && (
                <section className="mb-6">
                    <h4 className="mb-3 border-b border-rule pb-1.5 text-[11px] font-bold tracking-wider text-ink">
                        技術スタック
                    </h4>
                    {/*
                     * 技術名は読点で連ねず 1 件ずつチップにする。読点区切りは「文章」として
                     * 読まれてしまい、個々の技術を拾い読みできない。
                     *
                     * 等幅にしない理由: `C言語` `グラフィックMW` のように日本語を含む技術名があり、
                     * 等幅フォントにグリフが無いと字形が混ざる。SNS リンク（`github` / `zenn`）は
                     * 短い英小文字の識別子なので等幅のままでよい。
                     *
                     * 枠線ではなく地色（--panel）で塗る。--paper との差は小さいが、チップの背景は
                     * 装飾でありコントラスト要件の対象外（文字は --body on --panel で 11.3:1 以上）。
                     * 枠線を引くと 30 個並んだときに線が主張しすぎる。
                     */}
                    <dl className="grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-2.5">
                        {techGroups.map((group) => (
                            <div key={group.category} className="contents">
                                <dt className="pt-1 text-right text-[10px] text-mute">
                                    {group.label}
                                </dt>
                                <dd className="flex flex-wrap gap-1.5">
                                    {group.items.map((item) => (
                                        <span
                                            key={item}
                                            className="rounded-sm bg-panel px-2 py-0.5 text-xs leading-relaxed text-body"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            {phases.length > 0 && (
                <section className="mb-6">
                    <h4 className="mb-3 border-b border-rule pb-1.5 text-[11px] font-bold tracking-wider text-ink">
                        担当フェーズ
                    </h4>
                    <p className="text-xs leading-loose text-body">{phases.join(' ・ ')}</p>
                </section>
            )}

            <section>
                <h4 className="mb-3 border-b border-rule pb-1.5 text-[11px] font-bold tracking-wider text-ink">
                    役割
                </h4>
                <p className="text-[13px] leading-loose text-body">{role}</p>
            </section>
        </article>
    );
}
