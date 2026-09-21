import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
    beforeEach(() => {
        // jsdom は Cookie と <html> の属性をテスト間で持ち越すため明示的に戻す。
        document.documentElement.removeAttribute('data-theme');
        document.cookie = 'theme=; Path=/; Max-Age=0';
    });

    // --- 正常系 ---
    it('ダークを押すと <html> の data-theme が dark になる', async () => {
        render(<ThemeToggle />);

        await userEvent.click(screen.getByRole('button', { name: 'ダークテーマに切り替える' }));

        expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('ライトを押すと <html> の data-theme が light になる', async () => {
        render(<ThemeToggle />);

        await userEvent.click(screen.getByRole('button', { name: 'ライトテーマに切り替える' }));

        expect(document.documentElement.dataset.theme).toBe('light');
    });

    // --- 準正常系（保存と再訪時の復元）---
    it('選択を Cookie に保存する（リロード後にサーバーが読む）', async () => {
        render(<ThemeToggle />);

        await userEvent.click(screen.getByRole('button', { name: 'ダークテーマに切り替える' }));

        expect(document.cookie).toContain('theme=dark');
    });

    it('押す前は data-theme を設定しない（サーバーが出した値を上書きしない）', () => {
        render(<ThemeToggle />);

        expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });

    it('連続して押すと最後の選択が残る', async () => {
        render(<ThemeToggle />);

        await userEvent.click(screen.getByRole('button', { name: 'ダークテーマに切り替える' }));
        await userEvent.click(screen.getByRole('button', { name: 'ライトテーマに切り替える' }));

        expect(document.documentElement.dataset.theme).toBe('light');
        expect(document.cookie).toContain('theme=light');
    });

    // --- 異常系（支援技術から操作できること）---
    it('2 つのボタンがそれぞれ名前で特定できる', () => {
        render(<ThemeToggle />);

        // トグル 1 個にすると「いまどちらか」を初期描画時に決められない。
        // ボタン 2 個なら各操作の行き先が明確になる、という設計判断を固定する。
        expect(screen.getAllByRole('button')).toHaveLength(2);
        expect(screen.getByRole('group', { name: '配色テーマ' })).toBeInTheDocument();
    });

    it('記号は読み上げ対象から外す', () => {
        render(<ThemeToggle />);

        // ○ / ● が読み上げられると意味を成さないため aria-hidden にしている。
        for (const symbol of ['○', '●']) {
            expect(screen.getByText(symbol)).toHaveAttribute('aria-hidden', 'true');
        }
    });
});
