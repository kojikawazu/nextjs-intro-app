'use client';

import Image from 'next/image';
import { Header } from '@/components/organisms/Header';
import { ContactForm } from '@/components/organisms/ContactForm';
import { SocialLinks } from '@/components/molecules/SocialLinks';
import { CareerCard } from '@/components/molecules/CareerCard';
import { ProductCard } from '@/components/molecules/ProductCard';
import { ArticleEntry } from '@/components/molecules/ArticleEntry';
import { summarizeCareers } from '@/lib/career-summary';
import { PortfolioData } from '@/types/portfolio';
import { toDateString } from '@/lib/custom-date';

/**
 * 経歴の開始・終了年月を表示用の期間文字列に整形する。
 *
 * `career_end` が `'now'` の場合は在籍中を意味するため、終了年月の代わりに「現在」を出す。
 * `'now'` は `new Date()` として解釈されるが、その値は表示に使われないため月跨ぎの影響はない。
 *
 * @param start - 開始年月（`YYYY年MM月` 形式）
 * @param end - 終了年月（`YYYY年MM月` 形式）、または在籍中を表す `'now'`
 * @returns `2023年4月 - 2024年3月` のような期間文字列。在籍中は `2023年4月 - 現在`
 */
function formatCareerPeriod(start: string, end: string): string {
    const startDate = new Date(toDateString(start));
    const endDate = end === 'now' ? new Date() : new Date(toDateString(end));

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;

    if (end === 'now') {
        return `${startYear}年${startMonth}月 - 現在`;
    }

    return `${startYear}年${startMonth}月 - ${endYear}年${endMonth}月`;
}

/** `HomeClient` の props。 */
export interface HomeClientProps {
    /** サーバー側で取得済みのポートフォリオ表示データ */
    portfolioData: PortfolioData;
}

/**
 * トップページの描画と対話を担うクライアントコンポーネント。
 *
 * **データ取得は行わない。** `page.tsx`（Server Component）が `repositories/` 経由で取得した
 * データを props で受け取るため、初期 HTML の時点で全セクションの本文が含まれる。
 *
 * `'use client'` を維持しているのは、Header のモバイルメニューやテーマトグル、
 * ContactForm の入力状態など、子のクライアントコンポーネントを配置するため。
 * 本コンポーネント自身は状態を持たない。
 *
 * ---- 画面に出す文章について（issue #138）----
 * **新しい文言は 1 つも書いていない。** GCS の JSON とコードの既存固定文字列だけで構成する。
 *
 * ただし `about_contents[1]`（「専門はバックエンド開発。…要件定義(検討)から設計、実装、
 * テスト設計、レビューまでの一連の流れを経験しております。」）だけは **About から Hero 直下へ
 * 移動**している。現行の見出し `Solving Problems with Technology` は「何ができる人か」を
 * 述べておらず、書体と余白では解けない。この段落がすでにその答えを書いていたため、
 * 新規作成ではなく**既存データの再配置**で解いた（issue #135 の弱点(1)）。
 *
 * Hero からは「テクノロジーを使って、お客様の課題解決を実現します」（直下の具体と同じことを
 * 抽象的に言っているだけで、具体の直前に置くと弱める）と「お問い合わせ」ボタン
 * （書類として読ませる設計に CTA が馴染まず、Contact へはヘッダーと末尾から到達できる）を削除した。
 */
export function HomeClient({ portfolioData }: HomeClientProps) {
    const navItems = [
        { name: portfolioData.navbar_data.about_name, href: '#about' },
        { name: portfolioData.navbar_data.career_name, href: '#career' },
        { name: portfolioData.navbar_data.product_name, href: '#product' },
        { name: portfolioData.navbar_data.article_name, href: '#articles' },
        { name: portfolioData.navbar_data.contact_name, href: '#contact' },
    ];

    const summary = summarizeCareers(portfolioData.career_data);

    // Hero へ引き上げる段落と、About に残す段落を分ける。
    const [, heroLead, ...restAboutParagraphs] = portfolioData.about_data.about_contents;
    const aboutParagraphs = [
        portfolioData.about_data.about_contents[0],
        ...restAboutParagraphs,
    ].filter((paragraph): paragraph is string => typeof paragraph === 'string');

    return (
        <div className="min-h-screen">
            <Header navItems={navItems} logo={portfolioData.navbar_data.link_title} />

            {/*
             * Hero: 見出し → 具体 → 数値帯 の 3 段のみ。
             * 上下余白は他セクション（.section-padding）より 1 段広く取る。先頭であり、
             * ヘッダーの罫線との間を詰めると見出しがヘッダーに貼り付いて見えるため。
             */}
            <section className="container animate-fade-in-up py-10 lg:py-14">
                {/*
                 * 折り返しは <br /> ではなく幅で作る。<br /> を挟むとテキストノードが分かれ、
                 * 見出しのアクセシブル名が「Solving Problemswith Technology」になりうる。
                 * e2e/home.spec.ts と error.spec.ts がこの名前で見出しを特定している。
                 */}
                <h1 className="max-w-[17ch] font-serif text-[28px] font-bold leading-snug tracking-wide text-ink sm:text-[34px]">
                    Solving Problems with Technology
                </h1>

                {heroLead && <p className="quote-panel mt-8 text-sm leading-loose">{heroLead}</p>}

                {/*
                 * 縦罫は引かない。上下の罫線と余白だけで 3 つの数値は分かれて読める。
                 *
                 * 等分した列（1 セル 277px）に対し中身は数十 px しかなく、縦罫が中身から
                 * 200px も離れて「何を区切っているのか」が読めない線になっていた。
                 * 仕事をしていない線は引くより消す。
                 *
                 * セル内側の余白も持たせない。持たせると「7」が本文マージンから内側へずれ、
                 * h1・引用・下の見出しと左端の縦ラインが通らなくなる。
                 */}
                <dl className="mt-8 grid grid-cols-3 border-y border-rule">
                    <div className="py-4">
                        <dd className="font-serif text-2xl font-bold leading-none text-ink">
                            {summary.projectCount}
                        </dd>
                        <dt className="mt-2 text-[10px] text-mute">プロジェクト</dt>
                    </div>
                    <div className="py-4">
                        <dd className="font-serif text-2xl font-bold leading-none text-ink">
                            {summary.technologyCount}
                        </dd>
                        <dt className="mt-2 text-[10px] text-mute">使用技術</dt>
                    </div>
                    <div className="py-4">
                        <dd className="font-serif text-2xl font-bold leading-none text-ink">
                            {summary.startYear ?? '—'}
                        </dd>
                        <dt className="mt-2 text-[10px] text-mute">経歴開始</dt>
                    </div>
                </dl>
            </section>

            {/* About */}
            <section id="about" className="container section-padding">
                <div className="section-heading">
                    <h2 className="font-serif text-lg font-bold tracking-widest text-ink">
                        {portfolioData.navbar_data.about_name}
                    </h2>
                    <hr />
                </div>

                <div className="mt-6 grid gap-7 sm:grid-cols-[8rem_1fr]">
                    <div>
                        <div className="relative h-32 w-32 overflow-hidden rounded-sm border border-rule">
                            <Image
                                src={portfolioData.about_data.about_img_url}
                                alt={portfolioData.about_data.about_name}
                                fill
                                className="object-cover"
                                sizes="128px"
                                priority
                            />
                        </div>
                        <SocialLinks links={portfolioData.about_data.sns_list} className="mt-3.5" />
                    </div>

                    <div>
                        {aboutParagraphs.map((content, index) => (
                            <p
                                key={index}
                                className="mb-3 text-[13px] leading-loose text-body last:mb-0"
                            >
                                {content}
                            </p>
                        ))}
                    </div>
                </div>
            </section>

            {/* Career */}
            <section id="career" className="container section-padding">
                <div className="section-heading">
                    <h2 className="font-serif text-lg font-bold tracking-widest text-ink">
                        {portfolioData.navbar_data.career_name}
                    </h2>
                    <hr />
                    <span className="font-mono text-[10px] text-mute">
                        {portfolioData.career_data.length}
                    </span>
                </div>
                <p className="mb-8 text-xs text-mute">これまでの経歴・実績</p>

                <div className="flex flex-col gap-10">
                    {portfolioData.career_data.map((career, index) => (
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

            {/*
             * Product: 実務経歴（Career）の直後に置く。採用担当者はまず実務を見るため、
             * 「何ができる人か」への到達を遅らせない位置に個人開発を差し込む（issue #135 の評価軸 1）。
             */}
            <section id="product" className="container section-padding">
                <div className="section-heading">
                    <h2 className="font-serif text-lg font-bold tracking-widest text-ink">
                        {portfolioData.navbar_data.product_name}
                    </h2>
                    <hr />
                    <span className="font-mono text-[10px] text-mute">
                        {portfolioData.product_data.product_items.length}
                    </span>
                </div>
                <p className="mb-8 text-xs text-mute">
                    {portfolioData.product_data.product_description}
                </p>

                <div className="flex flex-col gap-10">
                    {portfolioData.product_data.product_items.map((product, index) => (
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

            {/*
             * Articles: 実績（Career / Product）の後ろに置く。何を作ったかより先に
             * 何を書いたかを見せる理由がないため。
             *
             * 見出しを `Blog` にしないのは、上の Product に自作のブログ基盤
             * 「ブログWebアプリ」が並んでいるため（issue #127）。
             */}
            <section id="articles" className="container section-padding">
                <div className="section-heading">
                    <h2 className="font-serif text-lg font-bold tracking-widest text-ink">
                        {portfolioData.navbar_data.article_name}
                    </h2>
                    <hr />
                    <span className="font-mono text-[10px] text-mute">
                        {portfolioData.article_data.article_items.length}
                    </span>
                </div>
                <p className="mb-8 text-xs text-mute">
                    {portfolioData.article_data.article_description}
                </p>

                <div>
                    {portfolioData.article_data.article_items.map((article, index) => (
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

            {/* Contact */}
            <section id="contact" className="container section-padding">
                <div className="section-heading">
                    <h2 className="font-serif text-lg font-bold tracking-widest text-ink">
                        {portfolioData.navbar_data.contact_name}
                    </h2>
                    <hr />
                </div>
                <p className="mb-8 text-xs text-mute">お気軽にお問い合わせください</p>

                <ContactForm />
            </section>

            {/* フッターは見出しの罫線を持たないため、ここだけ上罫で区切る。 */}
            <footer className="border-t border-rule">
                <div className="container flex h-16 items-center justify-between font-mono text-[10px] text-mute">
                    <span>{portfolioData.footer_data.copyright}</span>
                    <span>{portfolioData.navbar_data.link_title}</span>
                </div>
            </footer>
        </div>
    );
}
