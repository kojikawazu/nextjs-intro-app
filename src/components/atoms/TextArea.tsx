import React, { useId } from 'react';
import { cn } from '@/utils/cn';

/** `TextArea` の props。ネイティブの `<textarea>` 属性をすべて受け付ける。 */
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** 入力欄の上に表示するラベル。未指定ならラベル自体を描画しない */
    label?: string;
    /** エラーメッセージ。指定すると枠線が警告色に変わり、`hint` の代わりに表示される */
    error?: string;
    /** 補助説明。`error` が指定されている間は表示されない */
    hint?: string;
}

/**
 * ラベル・補助説明・エラー表示を内包した複数行入力。
 *
 * 高さは最小 120px で、利用者が縦方向にのみリサイズできる（`resize-y`）。
 * `forwardRef` を使う理由、`<label>` の関連付け、`aria-describedby` / `aria-invalid` の扱い、
 * 枠線に `--field` を使う理由はいずれも `Input` と同じ。
 */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className, label, error, hint, ...props }, ref) => {
        const hasError = !!error;
        // 詳細は Input.tsx を参照（同じ方針）。
        const generatedId = useId();
        const textAreaId = props.id ?? generatedId;
        const errorId = `${textAreaId}-error`;
        const hintId = `${textAreaId}-hint`;
        const describedBy = hasError ? errorId : hint ? hintId : undefined;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={textAreaId} className="block text-xs font-medium text-mute">
                        {label}
                        {props.required && <span className="ml-1 text-acc">*</span>}
                    </label>
                )}
                <textarea
                    id={textAreaId}
                    aria-invalid={hasError || undefined}
                    aria-describedby={describedBy}
                    className={cn(
                        'block min-h-[120px] w-full resize-y rounded-sm border bg-panel px-3 py-2.5 text-sm text-ink',
                        'placeholder:text-mute',
                        'focus:outline-none focus:ring-2 focus:ring-acc focus:ring-offset-0',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        hasError ? 'border-warn focus:ring-warn' : 'border-field',
                        className,
                    )}
                    ref={ref}
                    {...props}
                />
                {hint && !error && (
                    <p id={hintId} className="text-xs text-mute">
                        {hint}
                    </p>
                )}
                {error && (
                    <p id={errorId} className="text-xs text-warn">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

TextArea.displayName = 'TextArea';
