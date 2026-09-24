import { cn } from '@/utils/cn';

/** `AiPracticeEntry` の props。 */
export interface AiPracticeEntryProps {
    /** 方針の見出し */
    title: string;
    /** 方針の要約（1 文） */
    description: string;
    /** 追加クラス */
    className?: string;
}

/**
 * AI 活用の方針 1 件分。見出しと要約 1 文を罫線区切りの「行」で組む。
 *
 * **`ArticleEntry` と同じ行の体裁にする。** 1 件あたりの情報量が見出しと 1 文だけで、
 * `CareerCard` / `ProductCard` の左罫カードにすると中身に対して枠が勝ち、縦に間延びする。
 * 詳細は別サイトの解説ページへ送る前提のため、ここは流し読みできる一覧であればよい。
 *
 * **要約が空なら段落を描画しない。** GCS の JSON は手書きのため、見出しだけを先に
 * 入れた状態がありうる。空の `<p>` を残すと余白だけが空いて行の高さが揃わなくなる。
 */
export function AiPracticeEntry({ title, description, className }: AiPracticeEntryProps) {
    const hasDescription = description.trim() !== '';

    return (
        <article className={cn('border-b border-rule py-4 first:pt-0', className)}>
            <h3 className="text-[13px] font-bold leading-relaxed text-ink">{title}</h3>
            {hasDescription && (
                <p className="mt-1.5 text-xs leading-loose text-mute">{description}</p>
            )}
        </article>
    );
}
