'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface HeaderProps {
    navItems: Array<{
        name: string;
        href: string;
    }>;
    logo: string;
}

export function Header({ navItems, logo }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const SCROLL_THRESHOLD = 10;
        const handleScroll = () => {
            setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled ? 'glass-effect shadow-glass' : 'bg-transparent',
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    <div className="flex items-center">
                        <h1
                            className={cn(
                                'text-xl lg:text-2xl font-bold transition-all duration-300',
                                isScrolled ? 'text-primary-400' : 'neon-text',
                            )}
                        >
                            {logo}
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToSection(item.href)}
                                className={cn(
                                    'text-sm font-medium transition-all duration-300 hover:scale-105',
                                    isScrolled
                                        ? 'text-white hover:text-primary-400'
                                        : 'text-secondary-200 hover:neon-text',
                                )}
                            >
                                {item.name}
                            </button>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className={cn(
                            'md:hidden p-2 transition-colors duration-300',
                            isScrolled ? 'text-white' : 'text-secondary-200',
                        )}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="メニューを開く"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-white/20 glass-effect">
                        <nav className="py-4 space-y-2">
                            {navItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollToSection(item.href)}
                                    className="block w-full text-left px-4 py-2 text-sm font-medium text-white hover:text-primary-400 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                                >
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

export type { HeaderProps };
