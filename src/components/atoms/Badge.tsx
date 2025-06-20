import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'accent' | 'outline';
    size?: 'sm' | 'md';
}

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
