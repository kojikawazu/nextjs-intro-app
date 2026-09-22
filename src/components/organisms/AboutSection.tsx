import Image from 'next/image';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { SocialLinks } from '@/components/molecules/SocialLinks';
import type { SNSItem } from '@/types/portfolio';

/** `AboutSection` の props。 */
export interface AboutSectionProps {
    /** セクション見出し（`navbar_data.about_name`） */
    title: string;
    /** 表示名。プロフィール画像の代替テキストに使う */
    name: string;
    /** プロフィール画像の URL */
    imageUrl: string;
    /** SNS リンク一覧 */
    snsList: SNSItem[];
    /** 本文の段落。Hero へ引き上げた分は含まない（`splitAboutContents` を参照） */
    paragraphs: string[];
}

/**
 * 自己紹介セクション。左にプロフィール画像と SNS、右に本文を置く。
 *
 * **氏名のラベルは出さない。** 写真の直下に名前を再掲する必要がないため、`about_name` は
 * 画像の `alt` としてのみ使う（issue #138）。
 *
 * **件数を持たないため `SectionHeading` に `count` を渡さない。** 段落数を出しても読み手の
 * 判断材料にならない。
 */
export function AboutSection({ title, name, imageUrl, snsList, paragraphs }: AboutSectionProps) {
    return (
        <section id="about" className="container section-padding">
            <SectionHeading title={title} />

            <div className="mt-6 grid gap-7 sm:grid-cols-[8rem_1fr]">
                <div>
                    <div className="relative h-32 w-32 overflow-hidden rounded-sm border border-rule">
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="128px"
                            priority
                        />
                    </div>
                    <SocialLinks links={snsList} className="mt-3.5" />
                </div>

                <div>
                    {paragraphs.map((content, index) => (
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
    );
}
