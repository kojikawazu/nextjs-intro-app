'use client';

import { Header } from '@/components/organisms/Header';
import { HeroSection } from '@/components/organisms/HeroSection';
import { AboutSection } from '@/components/organisms/AboutSection';
import { CareerSection } from '@/components/organisms/CareerSection';
import { ProductSection } from '@/components/organisms/ProductSection';
import { ArticlesSection } from '@/components/organisms/ArticlesSection';
import { ContactSection } from '@/components/organisms/ContactSection';
import { SiteFooter } from '@/components/organisms/SiteFooter';
import { splitAboutContents } from '@/lib/about-contents';
import { summarizeCareers } from '@/lib/career-summary';
import { PortfolioData } from '@/types/portfolio';

/** `HomeClient` の props。 */
export interface HomeClientProps {
    /** サーバー側で取得済みのポートフォリオ表示データ */
    portfolioData: PortfolioData;
}

/**
 * トップページの**合成ルート**。セクションを並べ、それぞれに必要なデータだけを渡す。
 *
 * **データ取得は行わない。** `page.tsx`（Server Component）が `repositories/` 経由で取得した
 * データを props で受け取るため、初期 HTML の時点で全セクションの本文が含まれる。
 *
 * **マークアップを持たない。** 各セクションの実装は `components/organisms/` にあり、ここは
 * 「どのセクションをどの順に並べ、どのデータを渡すか」だけを決める（issue #153）。
 * 以前は 7 セクションすべてをインラインで実装しており 296 行あった。
 *
 * **`PortfolioData` 全体を各セクションへ渡さない。** 必要な部分だけを props に展開することで、
 * セクションが何に依存しているかがシグネチャに現れ、単体でテストできる。
 *
 * `'use client'` を維持しているのは、Header のモバイルメニューやテーマトグル、ContactForm の
 * 入力状態など、子のクライアントコンポーネントを配置するため。本コンポーネント自身は状態を
 * 持たない。
 *
 * ---- 画面に出す文章について（issue #138）----
 * **新しい文言は 1 つも書いていない。** GCS の JSON とコードの既存固定文字列だけで構成する。
 * `about_contents[1]` を About から Hero 直下へ移す再配置のみ行っており、その判断と理由は
 * `splitAboutContents`（`src/lib/about-contents.ts`）に記録している。
 */
export function HomeClient({ portfolioData }: HomeClientProps) {
    const navbar = portfolioData.navbar_data;

    const navItems = [
        { name: navbar.about_name, href: '#about' },
        { name: navbar.career_name, href: '#career' },
        { name: navbar.product_name, href: '#product' },
        { name: navbar.article_name, href: '#articles' },
        { name: navbar.contact_name, href: '#contact' },
    ];

    const summary = summarizeCareers(portfolioData.career_data);
    const { heroLead, aboutParagraphs } = splitAboutContents(
        portfolioData.about_data.about_contents,
    );

    return (
        <div className="min-h-screen">
            <Header navItems={navItems} logo={navbar.link_title} />

            <HeroSection lead={heroLead} summary={summary} />

            <AboutSection
                title={navbar.about_name}
                name={portfolioData.about_data.about_name}
                imageUrl={portfolioData.about_data.about_img_url}
                snsList={portfolioData.about_data.sns_list}
                paragraphs={aboutParagraphs}
            />

            <CareerSection title={navbar.career_name} careers={portfolioData.career_data} />

            <ProductSection title={navbar.product_name} data={portfolioData.product_data} />

            <ArticlesSection title={navbar.article_name} data={portfolioData.article_data} />

            <ContactSection title={navbar.contact_name} />

            <SiteFooter
                copyright={portfolioData.footer_data.copyright}
                siteTitle={navbar.link_title}
            />
        </div>
    );
}
