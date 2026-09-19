import React, { useId } from 'react';
import { cn } from '@/utils/cn';

/** `Input` の props。ネイティブの `<input>` 属性をすべて受け付ける。 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** 入力欄の上に表示するラベル。未指定ならラベル自体を描画しない */
    label?: string;
    /** エラーメッセージ。指定すると枠線が赤系に変わり、`hint` の代わりに表示される */
    error?: string;
    /** 補助説明。`error` が指定されている間は表示されない */
    hint?: string;
}

/**
 * ラベル・補助説明・エラー表示を内包した単一行入力。
 *
 * `forwardRef` で `ref` を内部の `<input>` へ透過する。React Hook Form の `register()` が
 * 返す `ref` を DOM 要素まで届けるために必要
 * （詳細は `docs/component-design-report/03-forward-ref.md` §1.2）。
 *
 * `<label>` は `htmlFor` / `id` で `<input>` と関連付ける。id は呼び出し側が `id` を
 * 指定していればそれを、なければ `useId()` で生成したものを使う。ラベルを「描画している」
 * ことと「関連付けている」ことは別であり、関連付けが無いとラベルをクリックしても
 * フォーカスが移らず、スクリーンリーダーも対応を読み上げない。
 *
 * `error` / `hint` は `aria-describedby` で入力欄に結び付け、エラー時は `aria-invalid` を立てる。
 * これによりフォーカス時に説明文やエラー内容が読み上げられる。
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, type = 'text', ...props }, ref) => {
        const hasError = !!error;
        // 呼び出し側が id を指定していればそれを優先する（外部から label を紐付けたい場合に備える）。
        const generatedId = useId();
        const inputId = props.id ?? generatedId;
        const errorId = `${inputId}-error`;
        const hintId = `${inputId}-hint`;
        // hint はエラー表示中は描画されないため、describedby も同時には指さない。
        const describedBy = hasError ? errorId : hint ? hintId : undefined;

        return (
            <div className="space-y-2">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-white">
                        {label}
                        {props.required && <span className="ml-1 text-red-400">*</span>}
                    </label>
                )}
                <input
                    id={inputId}
                    aria-invalid={hasError || undefined}
                    aria-describedby={describedBy}
                    type={type}
                    className={cn(
                        'block w-full glass-effect rounded-xl px-4 py-3 text-sm text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
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

Input.displayName = 'Input';

export { Input };
export type { InputProps };
