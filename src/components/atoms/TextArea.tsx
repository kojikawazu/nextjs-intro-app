import React, { useId } from 'react';
import { cn } from '@/utils/cn';

/** `TextArea` の props。ネイティブの `<textarea>` 属性をすべて受け付ける。 */
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** 入力欄の上に表示するラベル。未指定ならラベル自体を描画しない */
    label?: string;
    /** エラーメッセージ。指定すると枠線が赤系に変わり、`hint` の代わりに表示される */
    error?: string;
    /** 補助説明。`error` が指定されている間は表示されない */
    hint?: string;
}

/**
 * ラベル・補助説明・エラー表示を内包した複数行入力。
 *
 * 高さは最小 120px で、利用者が縦方向にのみリサイズできる（`resize-y`）。
 * `forwardRef` を使う理由と、`<label>` の関連付け・`aria-describedby` / `aria-invalid` の
 * 扱いは `Input` と同じ。
 */
const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className, label, error, hint, ...props }, ref) => {
        const hasError = !!error;
        // 詳細は Input.tsx を参照（同じ方針）。
        const generatedId = useId();
        const textAreaId = props.id ?? generatedId;
        const errorId = `${textAreaId}-error`;
        const hintId = `${textAreaId}-hint`;
        const describedBy = hasError ? errorId : hint ? hintId : undefined;

        return (
            <div className="space-y-2">
                {label && (
                    <label htmlFor={textAreaId} className="block text-sm font-medium text-white">
                        {label}
                        {props.required && <span className="ml-1 text-red-400">*</span>}
                    </label>
                )}
                <textarea
                    id={textAreaId}
                    aria-invalid={hasError || undefined}
                    aria-describedby={describedBy}
                    className={cn(
                        'block w-full glass-effect rounded-xl px-4 py-3 text-sm text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[120px] transition-all duration-300',
                        hasError
                            ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400'
                            : 'border-white/20 hover:border-white/30',
                        className,
                    )}
                    ref={ref}
                    {...props}
                />
                {hint && !error && (
                    <p id={hintId} className="text-xs text-secondary-400">
                        {hint}
                    </p>
                )}
                {error && (
                    <p id={errorId} className="text-xs text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

TextArea.displayName = 'TextArea';

export { TextArea };
export type { TextAreaProps };
