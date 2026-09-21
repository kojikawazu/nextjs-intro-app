'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { cn } from '@/utils/cn';

/** `Header` の props。 */
export interface HeaderProps {
    /** ナビゲーション項目。`name` が表示ラベル、`href` が遷移先のページ内アンカー */
    navItems: Array<{
        name: string;
        href: string;
    }>;
    /** ヘッダー左端に表示するロゴ / サイトタイトルのテキスト */
    logo: string;
}

/**
 * 画面上部のヘッダー。
 *
 * **スクロール追従をやめ、地の流れに置いた。** 旧デザインは固定ヘッダーにガラス調の
 * 背景を敷いていたが、書類として読ませる設計では本文に被る要素が邪魔になる。
 * 併せてスクロール量の監視も不要になった。
 *
 * ナビは `<button>` のまま維持している。`e2e/home.spec.ts` と `e2e/security.spec.ts` が
 * `getByRole('button', { name: 'Contact' })` でハイドレーション完了を確認しており、
 * `<a>` へ変えると JS を実行しなくても遷移してしまい、確認の意味が失われる
 * （issue #131 で一度壊した箇所）。
 *
 * モバイルメニューの開閉状態だけを内部で持つため Client Component。
 * 外部から DOM を触る必要がないため `forwardRef` は使わない
 * （判断基準は `docs/component-design-report/03-forward-ref.md` §2.2）。
 */
export function Header({ navItems, logo }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <header className="border-b border-rule">
            <div className="container flex h-16 items-center gap-5">
                <span className="mr-auto font-serif text-[15px] font-bold tracking-wide text-ink">
                    {logo}
                </span>

                {/* デスクトップ: 項目が 6 件（#127〜#129 の追加後）でも収まる幅で組む。 */}
                <nav className="hidden items-center gap-5 md:flex">
                    {navItems.map((item) => (
                        <button
                            key={item.href}
                            type="button"
                            onClick={() => scrollToSection(item.href)}
                            className="text-xs tracking-wide text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
                        >
                            {item.name}
                        </button>
                    ))}
                </nav>

                <ThemeToggle />

                <button
                    type="button"
                    className="p-1 text-mute md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="メニューを開く"
                    aria-expanded={isMobileMenuOpen}
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d={
                                isMobileMenuOpen
                                    ? 'M6 18L18 6M6 6l12 12'
                                    : 'M4 7h16M4 12h16M4 17h16'
                            }
                        />
                    </svg>
                </button>
            </div>

            {isMobileMenuOpen && (
                <nav className={cn('border-t border-rule md:hidden')}>
                    <div className="container py-2">
                        {navItems.map((item) => (
                            <button
                                key={item.href}
                                type="button"
                                onClick={() => scrollToSection(item.href)}
                                className="block w-full py-2 text-left text-sm text-body transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </nav>
            )}
        </header>
    );
}
