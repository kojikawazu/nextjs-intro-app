import Image from 'next/image';
import { cn } from '@/utils/cn';
import { SNSItem } from '@/types/portfolio';

/** `SocialLinks` の props。 */
interface SocialLinksProps {
    /** 表示する SNS リンク一覧。並び順はそのまま描画順になる */
    links: SNSItem[];
    /** 追加クラス */
    className?: string;
    /** アイコンの表示サイズ。既定は `md`（`sm` = 24px / `md` = 32px / `lg` = 40px） */
    size?: 'sm' | 'md' | 'lg';
}

const sizes = {
    sm: { container: 'w-6 h-6', image: 24 },
    md: { container: 'w-8 h-8', image: 32 },
    lg: { container: 'w-10 h-10', image: 40 },
};

/**
 * SNS プロフィールへのアイコンリンクを横並びで表示する。
 *
 * 各リンクは別タブで開き、`rel="noopener noreferrer"` を付与して
 * 遷移先から `window.opener` 経由で操作されるのを防ぐ。
 * アイコンだけでは用途が伝わらないため、`aria-label` に「{SNS名}のプロフィールを開く」を設定している。
 */
export function SocialLinks({ links, className, size = 'md' }: SocialLinksProps) {
    return (
        <div className={cn('flex items-center space-x-4', className)}>
            {links.map((link, index) => (
                <a
                    key={index}
                    href={link.sns_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-lg transition-all duration-200 hover:scale-110"
                    aria-label={`${link.sns_name}のプロフィールを開く`}
                >
                    <div className="relative">
                        <Image
                            src={link.sns_img}
                            alt={`${link.sns_name} icon`}
                            width={sizes[size].image}
                            height={sizes[size].image}
                            className={cn(
                                'transition-all duration-200 group-hover:brightness-110',
                                sizes[size].container,
                            )}
                        />
                        <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
                    </div>
                </a>
            ))}
        </div>
    );
}

export type { SocialLinksProps };
