import Image from 'next/image';
import { cn } from '@/utils/cn';

interface SkillCardProps {
    name: string;
    description: string;
    iconUrl: string;
    className?: string;
    style?: React.CSSProperties;
}

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
