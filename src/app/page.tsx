'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Header } from '@/components/organisms/Header';
import { ContactForm } from '@/components/organisms/ContactForm';
import { SocialLinks } from '@/components/molecules/SocialLinks';
import { SkillCard } from '@/components/molecules/SkillCard';
import { CareerCard } from '@/components/molecules/CareerCard';
import { Button } from '@/components/atoms/Button';
import { PortfolioData } from '@/types/portfolio';

function formatCareerPeriod(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = end === 'now' ? new Date() : new Date(end);

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;

    if (end === 'now') {
        return `${startYear}年${startMonth}月 - 現在`;
    }

    return `${startYear}年${startMonth}月 - ${endYear}年${endMonth}月`;
}

const INITIAL_SKILLS_COUNT = 9;
const SKILLS_INCREMENT = 6;

export default function HomePage() {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [visibleSkillsCount, setVisibleSkillsCount] = useState(INITIAL_SKILLS_COUNT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/portfolio');
                if (!response.ok) {
                    throw new Error('Failed to fetch portfolio data');
                }
                const data = await response.json();
                setPortfolioData(data);
            } catch (error) {
                console.error('Error fetching portfolio data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!portfolioData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load portfolio data</p>
                    <Button onClick={() => window.location.reload()}>Reload Page</Button>
                </div>
            </div>
        );
    }

    const navItems = [
        { name: portfolioData.navbar_data.about_name, href: '#about' },
        { name: portfolioData.navbar_data.career_name, href: '#career' },
        { name: portfolioData.navbar_data.skills_name, href: '#skills' },
        { name: portfolioData.navbar_data.contact_name, href: '#contact' },
    ];

    const scrollToContact = () => {
        const element = document.querySelector('#contact');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const showMoreSkills = () => {
        setVisibleSkillsCount((prev) => prev + SKILLS_INCREMENT);
    };

    const visibleSkills = portfolioData.skills_data.skills_cards.slice(0, visibleSkillsCount);
    const hasMoreSkills = visibleSkillsCount < portfolioData.skills_data.skills_cards.length;

    return (
        <div className="min-h-screen">
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

            {/* Skills Section */}
            <section id="skills" className="section-padding relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-900 to-secondary-800" />
                <div className="absolute inset-0 mesh-background opacity-30" />

                <div className="container relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold neon-text mb-4">Skills</h2>
                        <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                            技術スキル・経験
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {visibleSkills.map((skill, index) => (
                            <SkillCard
                                key={index}
                                name={skill.skills_card_name}
                                description={skill.skills_card_contents}
                                iconUrl={skill.skills_card_icon}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
                            />
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        {hasMoreSkills ? (
                            <Button variant="outline" onClick={showMoreSkills} className="mx-auto">
                                and more...
                            </Button>
                        ) : (
                            <p className="text-secondary-300">
                                {portfolioData.skills_data.skills_more}
                            </p>
                        )}
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
