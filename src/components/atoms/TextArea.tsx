import React from 'react';
import { cn } from '@/utils/cn';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className, label, error, hint, ...props }, ref) => {
        const hasError = !!error;

        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-white">
                        {label}
                        {props.required && <span className="ml-1 text-red-400">*</span>}
                    </label>
                )}
                <textarea
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
                {hint && !error && <p className="text-xs text-secondary-400">{hint}</p>}
                {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
        );
    },
);

TextArea.displayName = 'TextArea';

export { TextArea };
export type { TextAreaProps };
