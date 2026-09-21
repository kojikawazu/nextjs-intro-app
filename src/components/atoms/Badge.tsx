import React from 'react';
import { cn } from '@/utils/cn';

/** `Badge` の props。ネイティブの `<span>` 属性をすべて受け付ける。 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    /**
     * 配色のバリエーション。既定は `accent`。
     * `accent` はアクセント色で塗った強い印（進行中の案件など）、
     * `outline` は枠線のみで、地の流れを乱したくない補助的な印に使う。
     */
    variant?: 'accent' | 'outline';
}

/** バリエーション別のクラス。 */
const VARIANT_CLASSES: Record<NonNullable<BadgeProps['variant']>, string> = {
    accent: 'bg-acc text-acc-on',
    outline: 'border border-rule text-mute',
};

/**
 * 状態を示す小さな印。
 *
 * 旧デザインでは技術スタックの羅列にも使っていたが、分類集約（issue #137）へ
 * 置き換えたため、現在の用途は「現在」のような**状態表示**に限られる。
 *
 * `<div>` ではなく `<span>` を使う。見出しやタイトルの行内に置くため、
 * ブロック要素だと文章の途中に挟めない。
 *
 * 表示専用で外部から DOM を触る必要がないため `forwardRef` を使わない
 * （判断基準は `docs/component-design-report/03-forward-ref.md` §2.2）。
 */
export function Badge({ className, variant = 'accent', children, ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest',
                VARIANT_CLASSES[variant],
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}
