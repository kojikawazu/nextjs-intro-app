import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            children,
            disabled,
            ...props
        },
        ref,
    ) => {
        const baseStyles =
            'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';

        const variants = {
            primary:
                'glass-card text-white hover:shadow-neon hover:scale-105 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 border-primary-400/30',
            secondary:
                'glass-effect text-white hover:bg-white/20 hover:shadow-glass-lg hover:scale-105 border-white/30',
            outline:
                'glass-effect border-2 border-primary-400/50 text-primary-300 hover:bg-primary-500/10 hover:border-primary-400 hover:text-primary-200 hover:shadow-neon-sm hover:scale-105',
            ghost: 'text-secondary-300 hover:bg-white/10 hover:text-white hover:scale-105',
        };

        const sizes = {
            sm: 'h-8 px-3 text-sm',
            md: 'h-10 px-4 text-base',
            lg: 'h-12 px-6 text-lg',
        };

        return (
            <button
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    isLoading && 'cursor-not-allowed',
                    className,
                )}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
