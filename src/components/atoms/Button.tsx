import React from 'react';
import { cn } from '@/utils/cn';

/** `Button` の props。ネイティブの `<button>` 属性をすべて受け付ける。 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * 見た目のバリエーション。既定は `primary`。
     * `primary` はアクセント色で塗った主要動線、`outline` は枠線のみ、
     * `ghost` は背景も枠も持たない最も控えめな表現。
     */
    variant?: 'primary' | 'outline' | 'ghost';
    /** 高さと文字サイズ。既定は `md`（`sm` = 32px / `md` = 40px / `lg` = 48px） */
    size?: 'sm' | 'md' | 'lg';
    /**
     * 送信中などの処理待ち状態。既定は `false`。
     * `true` の間はスピナーを先頭に表示し、`disabled` 属性も立てて二重送信を防ぐ。
     */
    isLoading?: boolean;
    /** ボタンのラベル。スピナー表示時もラベルは残る */
    children: React.ReactNode;
}

/** バリエーション別のクラス。角丸を 2px に抑えているのは、書類の質感に丸みが馴染まないため。 */
const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-acc text-acc-on hover:opacity-90',
    outline: 'border border-field text-ink hover:bg-panel',
    ghost: 'text-mute hover:text-ink',
};

/** サイズ別のクラス。 */
const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-7 text-sm',
};

/**
 * アプリ共通のボタン。
 *
 * `forwardRef` で `ref` を内部の `<button>` へ透過する。React Hook Form の `register()` が
 * 返す `ref` がカスタムコンポーネントで止まるとフォーム制御が効かなくなるため
 * （詳細は `docs/component-design-report/03-forward-ref.md` §1.2）。
 *
 * `disabled` は `disabled || isLoading` で評価されるので、処理中は呼び出し側が
 * `disabled` を指定しなくても押せない状態になる。
 *
 * フォーカスリングは `--acc` を使う。地の色（`--paper`）との間に `ring-offset` を挟むのは、
 * ボタン自身が `--acc` で塗られている場合にリングが同化して見えなくなるため。
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
        return (
            <button
                className={cn(
                    'inline-flex items-center justify-center rounded-sm font-bold tracking-wide transition-opacity',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
                    'disabled:pointer-events-none disabled:opacity-50',
                    VARIANT_CLASSES[variant],
                    SIZE_CLASSES[size],
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
                        aria-hidden="true"
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
