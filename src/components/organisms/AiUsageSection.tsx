import { AiPracticeEntry } from '@/components/molecules/AiPracticeEntry';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import type { AiUsageData } from '@/types/portfolio';

/** `AiUsageSection` の props。 */
export interface AiUsageSectionProps {
    /** セクション見出し（`navbar_data.ai_usage_name`） */
    title: string;
    /** AI 活用セクションの表示データ */
    data: AiUsageData;
}

/**
 * AI 活用セクション。原則・方針の要約・詳細ページへのリンクを縦に並べる。
 *
 * **概要と導線だけを持つ。** 詳細は別サイトの解説ページにあり、ここはその要約である
 * （判断の根拠は `AiUsageData` の JSDoc を参照）。
 *
 * **実務経歴（Career）の直後、個人開発（Product）より前に置く。** AI をどう開発に組み込んで
 * いるかは採用担当者・発注検討者の関心が高まっている情報であり、実務を見た次に届く位置へ
 * 上げる。個人開発・執筆記事より後ろに回すと、関心の高い情報ほど遠くなる（issue #129）。
 *
 * **見出しに件数を出さない。** 方針の数は実績の件数と違って多寡に意味がなく、
 * 数字だけが出ても何の件数か伝わらない（About / Contact と同じ扱い）。
 *
 * **詳細 URL が空ならリンクを描画しない。** `<a href="">` は現在のページ自身を指し、
 * 押すと再読み込みされるだけになるため（`ProductCard` / `ArticleEntry` と同じ方針）。
 */
export function AiUsageSection({ title, data }: AiUsageSectionProps) {
    const hasDetailLink = data.ai_usage_detail_url.trim() !== '';

    return (
        <section id="ai-usage" className="container section-padding">
            <SectionHeading title={title} />
            <p className="mb-8 text-xs text-mute">{data.ai_usage_description}</p>

            {data.ai_practices.length > 0 && (
                <div>
                    {data.ai_practices.map((practice, index) => (
                        <AiPracticeEntry
                            key={index}
                            title={practice.ai_practice_title}
                            description={practice.ai_practice_contents}
                        />
                    ))}
                </div>
            )}

            {hasDetailLink && (
                <a
                    href={data.ai_usage_detail_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    /*
                     * 「詳しく見る」だけでは何の詳細かが伝わらない（リンク一覧で読み上げると
                     * 文脈が落ちる）。行き先と別タブで開くことをアクセシブル名で補う。
                     */
                    aria-label={`${title}の詳細を新しいタブで開く`}
                    className="mt-6 inline-block rounded-sm border border-rule px-2 py-1 font-mono text-[10px] tracking-wide text-mute transition-colors hover:border-field hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
                >
                    詳しく見る ↗
                </a>
            )}
        </section>
    );
}
