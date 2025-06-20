import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/utils/cn';

interface CareerCardProps {
    title: string;
    period: string;
    teamSize: string;
    description: string;
    techStack: string[];
    phases: string[];
    role: string;
    isCurrent?: boolean;
    className?: string;
}

export function CareerCard({
    title,
    period,
    teamSize,
    description,
    techStack,
    phases,
    role,
    isCurrent = false,
    className,
}: CareerCardProps) {
    return (
        <div
            className={cn(
                'group relative glass-card rounded-2xl p-6 floating-card overflow-hidden',
                className,
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />

            {isCurrent && (
                <div className="absolute -top-2 -right-2 z-20">
                    <Badge
                        variant="accent"
                        className="bg-gradient-to-r from-accent-500 to-accent-400 text-white shadow-neon-sm animate-pulse"
                    >
                        現在
                    </Badge>
                </div>
            )}

            <div className="relative z-10 space-y-4">
                <div>
                    <h3 className="text-xl font-semibold text-white group-hover:neon-text transition-all duration-300 ease-out mb-2">
                        {title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-300">
                        <span className="flex items-center">
                            <svg
                                className="w-4 h-4 mr-1 text-primary-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            {period}
                        </span>
                        <span className="flex items-center">
                            <svg
                                className="w-4 h-4 mr-1 text-primary-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            {teamSize}
                        </span>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent" />

                <div>
                    <p className="text-sm text-secondary-200 leading-relaxed">{description}</p>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gradient mb-2">技術スタック</h4>
                    <div className="flex flex-wrap gap-2">
                        {techStack.map((tech, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                size="sm"
                                className="glass-effect border-primary-400/30 text-primary-300 hover:text-primary-200"
                            >
                                {tech}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gradient mb-2">担当フェーズ</h4>
                    <div className="flex flex-wrap gap-2">
                        {phases.map((phase, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                size="sm"
                                className="border-purple-400/50 text-purple-300 hover:text-purple-200"
                            >
                                {phase}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gradient mb-2">役割</h4>
                    <p className="text-sm text-secondary-200 leading-relaxed">{role}</p>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
        </div>
    );
}

export type { CareerCardProps };
