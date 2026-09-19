import Image from 'next/image';
import { cn } from '@/utils/cn';

/** `SkillCard` の props。 */
interface SkillCardProps {
    /** スキル名。カードの見出しになる */
    name: string;
    /** スキルの説明 / 経験詳細 */
    description: string;
    /** スキルアイコン画像の URL（GCS 上の画像を想定） */
    iconUrl: string;
    /** 追加クラス。呼び出し側は新規表示カードにのみ `animate-fade-in-up` を渡す */
    className?: string;
    /**
     * インラインスタイル。段階表示で新しく現れたカードに `animationDelay` を渡し、
     * 1 枚ずつずらしてフェードインさせるために使う（`page.tsx` の `isNew` 判定を参照）。
     */
    style?: React.CSSProperties;
}

/**
 * スキル 1 件を表すカード。
 *
 * 表示専用のため `forwardRef` は使わない
 * （判断基準は `docs/component-design-report/03-forward-ref.md` §2.2）。
 */
export function SkillCard({ name, description, iconUrl, className, style }: SkillCardProps) {
    return (
        <div
            className={cn(
                'group relative glass-card rounded-2xl p-6 floating-card overflow-hidden',
                className,
            )}
            style={style}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex items-start space-x-4">
                <div className="relative h-12 w-12 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-purple-400 rounded-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                    <Image
                        src={iconUrl}
                        alt={`${name} icon`}
                        width={48}
                        height={48}
                        className="relative z-10 rounded-lg object-contain"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-white group-hover:neon-text transition-all duration-300 mb-2">
                        {name}
                    </h3>

                    <p className="text-sm text-secondary-300 leading-relaxed group-hover:text-secondary-200 transition-colors duration-300">
                        {description}
                    </p>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>
    );
}

export type { SkillCardProps };
