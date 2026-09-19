import React from 'react';
import { cn } from '@/utils/cn';

/** `Badge` の props。ネイティブの `<div>` 属性をすべて受け付ける。 */
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * 配色のバリエーション。既定は `default`。
     * `default` / `secondary` / `accent` はテーマカラー別のガラス調、
     * `outline` は白の半透明枠線で、特定の色味を持たせたくない場合に使う。
     */
    variant?: 'default' | 'secondary' | 'accent' | 'outline';
    /** 余白と文字サイズ。既定は `md` */
    size?: 'sm' | 'md';
}

/**
 * 技術スタックやフェーズを示すピル型のラベル。
 *
 * 表示専用で外部から DOM を触る必要がないため、`forwardRef` を使わない
 * （判断基準は `docs/component-design-report/03-forward-ref.md` §2.2）。
 */
function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
    const variants = {
        default: 'glass-effect border-primary-400/30 text-primary-300',
        secondary: 'glass-effect border-secondary-400/30 text-secondary-300',
        accent: 'glass-effect border-accent-400/30 text-accent-300',
        outline: 'glass-effect border border-white/20 text-white/80',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
    };

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full font-medium transition-all duration-300 hover:scale-105',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export { Badge };
export type { BadgeProps };
