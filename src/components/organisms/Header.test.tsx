import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';

const NAV_ITEMS = [
    { name: 'About', href: '#about' },
    { name: 'Career', href: '#career' },
    { name: 'Contact', href: '#contact' },
];

/**
 * ナビの遷移先セクションを DOM に用意し、`scrollIntoView` の呼び出しを記録する。
 *
 * jsdom は `Element.prototype.scrollIntoView` を実装していないため、呼ぶと TypeError になる。
 * ここでは「どの要素に対して呼ばれたか」を確かめたいので、素の未実装を補うのではなく
 * spy を差し込む。DOM API（外部 I/O 相当）のみを対象にしており、ナビの判定ロジック自体は
 * 実物を動かしている。
 *
 * @returns spy 本体と、後片付け用の `restore`
 */
function stubScrollIntoView() {
    const scrollIntoView = vi.fn();
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scrollIntoView;

    return {
        scrollIntoView,
        restore: () => {
            Element.prototype.scrollIntoView = original;
        },
    };
}

describe('Header', () => {
    let stub: ReturnType<typeof stubScrollIntoView>;

    beforeEach(() => {
        stub = stubScrollIntoView();
        // ナビの遷移先。scrollToSection は querySelector で引くため実体が要る。
        for (const item of NAV_ITEMS) {
            const section = document.createElement('section');
            section.id = item.href.slice(1);
            document.body.appendChild(section);
        }
    });

    afterEach(() => {
        stub.restore();
        document.querySelectorAll('section').forEach((section) => section.remove());
    });

    // --- 正常系 ---
    it('ロゴとナビ項目を表示し、押すと対象セクションへスクロールする', async () => {
        render(<Header navItems={NAV_ITEMS} logo="TechProfile Pro" />);

        expect(screen.getByText('TechProfile Pro')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Career' }));

        expect(stub.scrollIntoView).toHaveBeenCalledTimes(1);
        expect(stub.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    // --- 準正常系（モバイルメニューの開閉）---
    it('モバイルメニューは初期状態で閉じている', () => {
        render(<Header navItems={NAV_ITEMS} logo="TechProfile Pro" />);

        expect(screen.getByRole('button', { name: 'メニューを開く' })).toHaveAttribute(
            'aria-expanded',
            'false',
        );
        // 閉じている間はナビ項目が 1 組だけ（デスクトップ側）。
        expect(screen.getAllByRole('button', { name: 'About' })).toHaveLength(1);
    });

    it('メニューボタンを押すと開き、ナビ項目が増える', async () => {
        render(<Header navItems={NAV_ITEMS} logo="TechProfile Pro" />);

        await userEvent.click(screen.getByRole('button', { name: 'メニューを開く' }));

        expect(screen.getByRole('button', { name: 'メニューを開く' })).toHaveAttribute(
            'aria-expanded',
            'true',
        );
        expect(screen.getAllByRole('button', { name: 'About' })).toHaveLength(2);
    });

    it('モバイルメニューの項目を押すとスクロールしてメニューが閉じる', async () => {
        render(<Header navItems={NAV_ITEMS} logo="TechProfile Pro" />);
        await userEvent.click(screen.getByRole('button', { name: 'メニューを開く' }));

        const [, mobileItem] = screen.getAllByRole('button', { name: 'Contact' });
        await userEvent.click(mobileItem);

        expect(stub.scrollIntoView).toHaveBeenCalledTimes(1);
        expect(screen.getAllByRole('button', { name: 'Contact' })).toHaveLength(1);
    });

    it('テーマ切り替えを内包する', () => {
        render(<Header navItems={NAV_ITEMS} logo="TechProfile Pro" />);

        expect(screen.getByRole('group', { name: '配色テーマ' })).toBeInTheDocument();
    });

    // --- 異常系 ---
    it('遷移先のセクションが無いときは何もしない（メニューも閉じない）', async () => {
        render(<Header navItems={[{ name: 'Blog', href: '#blog' }]} logo="TechProfile Pro" />);
        await userEvent.click(screen.getByRole('button', { name: 'メニューを開く' }));

        const [, mobileItem] = screen.getAllByRole('button', { name: 'Blog' });
        await userEvent.click(mobileItem);

        // #127〜#129 で追加予定のセクションが未実装の間も落ちないこと。
        expect(stub.scrollIntoView).not.toHaveBeenCalled();
        expect(screen.getAllByRole('button', { name: 'Blog' })).toHaveLength(2);
    });

    it('ナビ項目が空でも描画できる', () => {
        render(<Header navItems={[]} logo="TechProfile Pro" />);

        expect(screen.getByText('TechProfile Pro')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'メニューを開く' })).toBeInTheDocument();
    });

    it('ナビは button のまま維持する（JS 無効時に遷移させない）', () => {
        // <a href="#..."> へ変えると JS を実行しなくても遷移してしまい、
        // e2e がハイドレーション完了の確認に使えなくなる（issue #131 で一度壊した箇所）。
        render(<Header navItems={NAV_ITEMS} logo="TechProfile Pro" />);

        expect(screen.queryAllByRole('link')).toHaveLength(0);
        expect(screen.getByRole('button', { name: 'Contact' })).toHaveAttribute('type', 'button');
    });
});
