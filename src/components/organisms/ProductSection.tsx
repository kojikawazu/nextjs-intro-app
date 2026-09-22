import { ProductCard } from '@/components/molecules/ProductCard';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import type { ProductData } from '@/types/portfolio';

/** `ProductSection` の props。 */
export interface ProductSectionProps {
    /** セクション見出し（`navbar_data.product_name`） */
    title: string;
    /** 個人開発セクションの表示データ */
    data: ProductData;
}

/**
 * 個人開発セクション。`ProductCard` を縦に並べる。
 *
 * **実務経歴（Career）の直後に置く。** 採用担当者はまず実務を見るため、「何ができる人か」への
 * 到達を遅らせない位置に個人開発を差し込む（issue #135 の評価軸 1）。
 *
 * 説明文は `product_description`（GCS 由来）を使う。Career と違いハードコードしていないのは、
 * 掲載するプロダクトの性格によって前置きを変えたくなるため。
 */
export function ProductSection({ title, data }: ProductSectionProps) {
    return (
        <section id="product" className="container section-padding">
            <SectionHeading title={title} count={data.product_items.length} />
            <p className="mb-8 text-xs text-mute">{data.product_description}</p>

            <div className="flex flex-col gap-10">
                {data.product_items.map((product, index) => (
                    <ProductCard
                        key={index}
                        title={product.product_title}
                        description={product.product_contents}
                        siteUrl={product.product_site_url}
                        repoUrl={product.product_repo_url}
                        techStack={product.product_skill_stack}
                    />
                ))}
            </div>
        </section>
    );
}
