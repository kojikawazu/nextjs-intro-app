import { cn } from '@/utils/cn';

/** `ArticleEntry` の props。 */
export interface ArticleEntryProps {
    /** 記事タイトル。リンクの可視テキストになる */
    title: string;
    /** 記事の URL */
    url: string;
    /** 掲載媒体（例: `Zenn`） */
    platform: string;
    /** 公開年月（`YYYY年M月` 形式） */
    publishedAt: string;
    /** 記事の概要 */
    description: string;
    /** 追加クラス */
    className?: string;
}

/**
 * 執筆記事 1 件分。
 *
 * **カードではなく罫線区切りの「行」で組む。** 記事は件数が増えやすく、1 件あたりの情報量も
 * 小さい。`CareerCard` / `ProductCard` と同じ左罫のカードにすると縦に間延びし、一覧として
 * 流し読みできなくなる。
 *
 * **`aria-label` を付けない。** `ProductCard` の `site` / `repo` はラベルが非記述的なため
 * アクセシブル名を補ったが、記事タイトルはそれ自体が行き先を説明している。ここで `aria-label` を
 * 足すと可視テキストを上書きすることになり、読み上げと見た目がずれるだけで利得がない。
 *
 * 媒体と公開年月は等幅で右端へ置く。本文と同じ書体で左に流すとタイトルとの区別が付きにくく、
 * 「どの媒体にいつ書いたか」を拾うのに読まなければならなくなる。
 *
 * **欠損したフィールドは中黒ごと落とす。** GCS の JSON は手書きのため、媒体や公開年月が
 * 空のまま入りうる。素朴に `${platform} ・ ${publishedAt}` と組むと `・ 2024年5月` のように
 * **行き場のない区切り記号だけが残る**。値のある分だけを中黒で連結する。
 *
 * **URL が空ならリンクにしない。** `<a href="">` は現在のページ自身を指すため、押すと
 * ページが再読み込みされる。「押せるのに何も起きない」より、押せない方が誤解が少ない。
 */
export function ArticleEntry({
    title,
    url,
    platform,
    publishedAt,
    description,
    className,
}: ArticleEntryProps) {
    const meta = [platform, publishedAt].filter((part) => part.trim() !== '').join(' ・ ');
    const hasLink = url.trim() !== '';

    return (
        <article className={cn('border-b border-rule py-4 first:pt-0', className)}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-[13px] font-bold leading-relaxed text-ink">
                    {hasLink ? (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-acc focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
                        >
                            {title}
                        </a>
                    ) : (
                        title
                    )}
                </h3>
                {meta && <p className="font-mono text-[10px] text-mute">{meta}</p>}
            </div>

            {description && <p className="mt-1.5 text-xs leading-loose text-mute">{description}</p>}
        </article>
    );
}
