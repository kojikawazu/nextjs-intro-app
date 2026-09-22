import { ArticleEntry } from '@/components/molecules/ArticleEntry';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import type { ArticleData } from '@/types/portfolio';

/** `ArticlesSection` の props。 */
export interface ArticlesSectionProps {
    /** セクション見出し（`navbar_data.article_name`） */
    title: string;
    /** 執筆記事セクションの表示データ */
    data: ArticleData;
}

/**
 * 執筆記事セクション。`ArticleEntry` を罫線区切りで縦に並べる。
 *
 * **実績（Career / Product）の後ろに置く。** 何を作ったかより先に何を書いたかを見せる理由が
 * ないため。
 *
 * **見出しは `Blog` ではなく `Articles`。** Product に自作のブログ基盤「ブログWebアプリ」を
 * 掲載しているため、`Blog` だと「作ったもの」と「書いた記事」が同じ語で並んでしまう（issue #127）。
 *
 * カード間の `gap` を持たないのは、`ArticleEntry` 自身が下罫と上下余白を持ち、行として
 * 連続して見える必要があるため。Career / Product が `gap-10` で離すのと意図的に異なる。
 */
export function ArticlesSection({ title, data }: ArticlesSectionProps) {
    return (
        <section id="articles" className="container section-padding">
            <SectionHeading title={title} count={data.article_items.length} />
            <p className="mb-8 text-xs text-mute">{data.article_description}</p>

            <div>
                {data.article_items.map((article, index) => (
                    <ArticleEntry
                        key={index}
                        title={article.article_title}
                        url={article.article_url}
                        platform={article.article_platform}
                        publishedAt={article.article_published_at}
                        description={article.article_contents}
                    />
                ))}
            </div>
        </section>
    );
}
