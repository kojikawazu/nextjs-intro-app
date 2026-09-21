'use client';

import Image from 'next/image';
import { Header } from '@/components/organisms/Header';
import { ContactForm } from '@/components/organisms/ContactForm';
import { SocialLinks } from '@/components/molecules/SocialLinks';
import { CareerCard } from '@/components/molecules/CareerCard';
import { Button } from '@/components/atoms/Button';
import { PortfolioData } from '@/types/portfolio';
import { Theme } from '@/types/theme';
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
interface HomeClientProps {
    /** サーバー側で取得済みのポートフォリオ表示データ */
    portfolioData: PortfolioData;
    /**
     * 利用者が明示的に選んだ配色テーマ。未選択なら `null`。
     *
     * `null` のときは `data-theme` を出力せず、OS の `prefers-color-scheme` に委ねる。
     * サーバー側で解決済みの値を受け取るため、初期描画時点で確定しており
     * テーマのちらつき（一度ライトで描画してからダークへ切り替わる現象）が起きない。
     */
    theme: Theme | null;
}

/**
 * トップページの描画と対話を担うクライアントコンポーネント。
 *
 * **データ取得は行わない。** `page.tsx`（Server Component）が `repositories/` 経由で取得した
 * データを props で受け取るため、初期 HTML の時点で全セクションの本文が含まれる。
 * 以前は本コンポーネントに相当する処理が `useEffect` で fetch していたため、
 * 初期 HTML にスピナーしか出力されていなかった。
 *
 * `'use client'` を維持しているのは、Header のモバイルメニュー・スクロール検知や
 * ContactForm の入力状態など、子のクライアントコンポーネントを配置するため。
 * 本コンポーネント自身は Skills セクションの削除（issue #126）により状態を持たなくなった。
 *
 * ルート要素の `data-theme` が配色トークンの適用範囲になる（issue #136）。
 * **現時点ではまだどの要素もトークンを参照していない**ため、この属性に表示上の効果はない。
 * 適用は issue #138 でまとめて行う。
 */
export function HomeClient({ portfolioData, theme }: HomeClientProps) {
    const navItems = [
        { name: portfolioData.navbar_data.about_name, href: '#about' },
        { name: portfolioData.navbar_data.career_name, href: '#career' },
        { name: portfolioData.navbar_data.contact_name, href: '#contact' },
    ];

    const scrollToContact = () => {
        const element = document.querySelector('#contact');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen" data-theme={theme ?? undefined}>
            <Header navItems={navItems} logo={portfolioData.navbar_data.link_title} />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center animated-bg particle-bg overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={portfolioData.hero_data.hero_img_url}
                        alt="Hero background"
                        fill
                        className="object-cover opacity-5"
                        priority
                    />
                </div>

                <div className="absolute inset-0 mesh-background opacity-30" />

                <div className="container relative z-10 text-center animate-fade-in-up">
                    <div className="space-y-8">
                        <h1 className="text-4xl lg:text-6xl font-bold text-white">
                            <span className="neon-text animate-glow">
                                Solving Problems with Technology
                            </span>
                        </h1>
                        <p className="text-xl text-secondary-200 max-w-3xl mx-auto leading-relaxed">
                            テクノロジーを使って、
                            <br />
                            お客様の課題解決を実現します
                        </p>
                        <Button size="lg" onClick={scrollToContact} className="animate-float">
                            お問い合わせ
                        </Button>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="section-padding relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-900 to-secondary-800" />
                <div className="absolute inset-0 mesh-background opacity-20" />

                <div className="container relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <div className="relative w-48 h-48 mx-auto lg:mx-0 mb-6 floating-card">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-yellow-100 to-amber-50 rounded-full shadow-neon animate-pulse" />
                                <Image
                                    src={portfolioData.about_data.about_img_url}
                                    alt={portfolioData.about_data.about_name}
                                    fill
                                    className="rounded-full object-cover relative z-10 border-4 border-yellow-300/60 shadow-2xl brightness-200 contrast-75 saturate-150"
                                />
                            </div>
                            <SocialLinks
                                links={portfolioData.about_data.sns_list}
                                className="justify-center lg:justify-start"
                                size="lg"
                            />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl lg:text-4xl font-bold neon-text mb-6">About</h2>
                            {portfolioData.about_data.about_contents.map((content, index) => (
                                <p key={index} className="text-secondary-200 leading-relaxed">
                                    {content}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Career Section */}
            <section id="career" className="section-padding relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-800 to-secondary-900" />
                <div className="absolute inset-0 particle-bg opacity-20" />

                <div className="container relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold neon-text mb-4">Career</h2>
                        <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                            これまでの経歴・実績
                        </p>
                    </div>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-400 to-purple-400 hidden md:block" />

                        <div className="space-y-12">
                            {portfolioData.career_data.map((career, index) => (
                                <div key={index} className="relative">
                                    {/* Timeline Dot */}
                                    <div className="absolute left-2 top-8 w-4 h-4 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full border-4 border-secondary-800 shadow-neon-sm hidden md:block animate-pulse" />

                                    {/* Career Card */}
                                    <div className="md:ml-12">
                                        <CareerCard
                                            title={career.career_title}
                                            period={formatCareerPeriod(
                                                career.career_start,
                                                career.career_end,
                                            )}
                                            teamSize={career.career_member}
                                            description={career.career_contents}
                                            techStack={career.career_skill_stack}
                                            phases={career.career_skill_phase}
                                            role={career.career_role}
                                            isCurrent={career.career_end === 'now'}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="section-padding relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-800 to-secondary-900" />
                <div className="absolute inset-0 particle-bg opacity-20" />

                <div className="container relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold neon-text mb-4">Contact</h2>
                        <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                            お気軽にお問い合わせください
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="glass-card rounded-2xl p-8">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative bg-secondary-950 text-white py-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-purple-900/20" />
                <div className="container relative z-10 text-center">
                    <p className="text-secondary-400">{portfolioData.footer_data.copyright}</p>
                </div>
            </footer>
        </div>
    );
}
