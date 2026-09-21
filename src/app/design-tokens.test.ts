import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * 配色トークンの不変条件を `globals.css` から直接検証する。
 *
 * **なぜ CSS を読むのか。** トークンの写像は「既定」「OS ダーク」「明示ライト」「明示ダーク」の
 * 4 ブロックに分かれており、トークンを 1 つ増やしたときに 1 ブロックだけ書き忘れても
 * ビルドは通り、lint も通り、**特定のテーマでだけ色が壊れる**。人間のレビューで
 * 4 ブロックを突き合わせるのは現実的でないため、機械で守る。
 *
 * コントラスト比も同様に、色を少し調整しただけで WCAG 2.1 AA を割り込む。
 * `docs/04-non-functional-specification.md` の要件なので、コメントではなくテストで固定する。
 */
const CSS = readFileSync(path.resolve(__dirname, './globals.css'), 'utf8');

/** テーマごとに値を持つ公開トークン。`--light-*` / `--dark-*` の接頭辞を除いた名前。 */
const TOKENS = [
    'paper',
    'ink',
    'body',
    'lead',
    'mute',
    'rule',
    'field',
    'panel',
    'acc',
    'acc-on',
    'warn',
] as const;

/**
 * セレクタ直後の `{ ... }` を、波括弧の対応を数えて取り出す。
 *
 * CSS パーサを持ち込まずに済ませるための最小実装。対象は自プロジェクトの 1 ファイルだけで
 * 構造が既知のため、文字列・コメント内の波括弧は考慮していない。
 *
 * @param source - 探索対象の CSS
 * @param selector - ブロックの直前に現れる文字列（セレクタや `@media` 条件）
 * @param from - 探索開始位置
 * @returns ブロックの中身と、閉じ波括弧の直後の位置
 * @throws {Error} セレクタまたは対応する波括弧が見つからない場合
 */
function blockAfter(source: string, selector: string, from = 0): { body: string; end: number } {
    const at = source.indexOf(selector, from);
    if (at === -1) {
        throw new Error(`セレクタが見つからない: ${selector}`);
    }

    const open = source.indexOf('{', at + selector.length);
    if (open === -1) {
        throw new Error(`波括弧が見つからない: ${selector}`);
    }

    let depth = 0;
    for (let i = open; i < source.length; i++) {
        if (source[i] === '{') depth++;
        if (source[i] === '}') {
            depth--;
            if (depth === 0) {
                return { body: source.slice(open + 1, i), end: i + 1 };
            }
        }
    }

    throw new Error(`波括弧が閉じていない: ${selector}`);
}

/**
 * ブロック内のカスタムプロパティ宣言を取り出す。ネストしたブロックの中身は含めない。
 *
 * @param body - ブロックの中身
 * @returns プロパティ名（`--` を除く）から値へのマップ
 */
function declarationsIn(body: string): Map<string, string> {
    // ネストしたブロック（@media 内の :root など）を取り除いてから走査する。
    const flat = body.replace(/\{[^{}]*\}/g, '');
    const result = new Map<string, string>();

    // tsconfig の target が es5 のため、イテレータは Array.from を経由する。
    for (const [, name, value] of Array.from(flat.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g))) {
        result.set(name, value.trim());
    }

    return result;
}

const rootBlock = blockAfter(CSS, ':root');
const rootDeclarations = declarationsIn(rootBlock.body);

const mediaBlock = blockAfter(CSS, '@media (prefers-color-scheme: dark)');
const mediaRootDeclarations = declarationsIn(blockAfter(mediaBlock.body, ':root').body);

const lightAttrDeclarations = declarationsIn(blockAfter(CSS, "[data-theme='light']").body);
const darkAttrDeclarations = declarationsIn(blockAfter(CSS, "[data-theme='dark']").body);

/**
 * 写像ブロックが「全公開トークンを、期待する接頭辞の値へ」割り当てているか検証する。
 *
 * @param declarations - 対象ブロックの宣言
 * @param prefix - 参照されるべき接頭辞（`light` または `dark`）
 */
function expectMapsAllTokens(declarations: Map<string, string>, prefix: 'light' | 'dark'): void {
    const mapped = Array.from(declarations.keys()).filter(
        (name) => !name.startsWith('light-') && !name.startsWith('dark-'),
    );

    expect(mapped.slice().sort()).toEqual(TOKENS.slice().sort());

    for (const token of TOKENS) {
        expect(declarations.get(token)).toBe(`var(--${prefix}-${token})`);
    }
}

describe('配色トークンの定義', () => {
    // --- 正常系 ---
    it('ライトとダークが同じトークン集合を定義している', () => {
        const light = Array.from(rootDeclarations.keys())
            .filter((n) => n.startsWith('light-'))
            .map((n) => n.replace('light-', ''))
            .sort();
        const dark = Array.from(rootDeclarations.keys())
            .filter((n) => n.startsWith('dark-'))
            .map((n) => n.replace('dark-', ''))
            .sort();

        expect(light).toEqual(TOKENS.slice().sort());
        expect(dark).toEqual(TOKENS.slice().sort());
    });

    // --- 準正常系（4 ブロックの写像漏れを検出する）---
    it(':root の既定がライト値を指している', () => {
        expectMapsAllTokens(rootDeclarations, 'light');
    });

    it('prefers-color-scheme: dark がダーク値を指している', () => {
        expectMapsAllTokens(mediaRootDeclarations, 'dark');
    });

    it("[data-theme='light'] がライト値を指している", () => {
        expectMapsAllTokens(lightAttrDeclarations, 'light');
    });

    it("[data-theme='dark'] がダーク値を指している", () => {
        expectMapsAllTokens(darkAttrDeclarations, 'dark');
    });

    // --- 異常系（カスケード順が崩れると明示指定が効かなくなる）---
    it('明示指定のブロックが OS 設定のブロックより後に書かれている', () => {
        // [data-theme] と :root は詳細度が同じ (0,1,0) ため、後勝ちでしか上書きできない。
        // 順序を入れ替えると「ダークの OS でライトを選んでも戻らない」不具合になる。
        const mediaAt = CSS.indexOf('@media (prefers-color-scheme: dark)');
        const lightAt = CSS.indexOf("[data-theme='light']");
        const darkAt = CSS.indexOf("[data-theme='dark']");

        expect(mediaAt).toBeGreaterThan(-1);
        expect(lightAt).toBeGreaterThan(mediaAt);
        expect(darkAt).toBeGreaterThan(mediaAt);
    });
});

// ---- 以下、コントラスト比の検証に使う色計算 ----
// 参照が本ファイルに閉じるため export しない（coding-standards.md「1 ファイルに閉じる」）。

/**
 * sRGB のガンマ補正を解除して線形値へ戻す。
 *
 * @param channel - sRGB の 1 チャンネル（0..1）
 * @returns 線形化した値（0..1）
 */
function toLinear(channel: number): number {
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/**
 * 線形値へガンマ補正をかけて sRGB へ戻す。
 *
 * @param channel - 線形の 1 チャンネル（0..1）
 * @returns sRGB の値（0..1）
 */
function fromLinear(channel: number): number {
    return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

/**
 * `oklch(L C H)` を sRGB の 0..1 三値へ変換する。
 *
 * 係数は Oklab の仕様（Björn Ottosson）に基づく LMS 経由の変換行列。
 * 色域外の値は 0..1 にクランプする（ブラウザの実装と同じく近似で足りる）。
 *
 * @param l - 知覚的な明度 0..1
 * @param c - クロマ
 * @param h - 色相（度）
 * @returns sRGB の `[r, g, b]`（各 0..1）
 */
function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
    const rad = (h * Math.PI) / 180;
    const a = c * Math.cos(rad);
    const b = c * Math.sin(rad);

    const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

    const linear: [number, number, number] = [
        4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp,
        -1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp,
        -0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp,
    ];

    return linear.map((v) => Math.min(1, Math.max(0, fromLinear(v)))) as [number, number, number];
}

/**
 * CSS の色表記（`#rrggbb` または `oklch(...)`）を sRGB の 0..1 三値へ変換する。
 *
 * @param css - CSS の色表記
 * @returns sRGB の `[r, g, b]`（各 0..1）
 * @throws {Error} 対応していない表記を渡した場合
 */
function parseColor(css: string): [number, number, number] {
    const hex = /^#([0-9a-f]{6})$/i.exec(css.trim());
    if (hex) {
        const n = parseInt(hex[1], 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }

    const oklch = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(css.trim());
    if (oklch) {
        return oklchToRgb(Number(oklch[1]), Number(oklch[2]), Number(oklch[3]));
    }

    throw new Error(`解釈できない色表記: ${css}`);
}

/**
 * WCAG の相対輝度を求める。
 *
 * @param rgb - sRGB の `[r, g, b]`（各 0..1）
 * @returns 相対輝度（0..1）
 */
function luminance(rgb: [number, number, number]): number {
    // 引数で分割代入すると jsdoc/check-param-names が rgb."0" 形式の @param を要求するため、
    // シグネチャは 1 引数のまま受け、本体で展開する。
    const [r, g, b] = rgb;
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * WCAG のコントラスト比を求める。
 *
 * @param foreground - 前景色の CSS 表記
 * @param background - 背景色の CSS 表記
 * @returns コントラスト比（1..21）
 */
function contrast(foreground: string, background: string): number {
    const a = luminance(parseColor(foreground));
    const b = luminance(parseColor(background));
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * テーマごとの生の色値を取り出す。
 *
 * @param theme - `light` または `dark`
 * @returns トークン名から CSS 色表記へのマップ
 */
function valuesOf(theme: 'light' | 'dark'): Record<string, string> {
    const entries = TOKENS.map((token) => {
        const value = rootDeclarations.get(`${theme}-${token}`);
        if (value === undefined) {
            throw new Error(`--${theme}-${token} が未定義`);
        }
        return [token, value] as const;
    });

    return Object.fromEntries(entries);
}

/** 文字色として 4.5:1 以上が必要な組み合わせ（`[前景, 背景]`）。 */
const TEXT_PAIRS: ReadonlyArray<readonly [string, string]> = [
    ['ink', 'paper'],
    ['body', 'paper'],
    ['lead', 'paper'],
    ['mute', 'paper'],
    ['acc', 'paper'],
    ['warn', 'paper'],
    ['body', 'panel'],
    ['mute', 'panel'],
    ['acc-on', 'acc'],
];

describe.each(['light', 'dark'] as const)('コントラスト比（%s）', (theme) => {
    const values = valuesOf(theme);

    // --- 正常系: 文字は WCAG 2.1 AA の 4.5:1 以上 ---
    it.each(TEXT_PAIRS)('%s on %s が 4.5:1 以上', (foreground, background) => {
        expect(contrast(values[foreground], values[background])).toBeGreaterThanOrEqual(4.5);
    });

    // --- 準正常系: 操作部品の境界は 1.4.11 の 3:1 以上 ---
    it('--field が --paper に対し 3:1 以上（入力欄・トグルの境界）', () => {
        expect(contrast(values.field, values.paper)).toBeGreaterThanOrEqual(3);
    });

    it('--field が --panel に対し 3:1 以上（面の上に置いた入力欄）', () => {
        expect(contrast(values.field, values.panel)).toBeGreaterThanOrEqual(3);
    });

    // --- 異常系: 装飾罫線に文字色を使い回すと読めなくなる ---
    it('--rule は文字色として使えない水準にとどまる（誤用の検出）', () => {
        // --rule は装飾用でコントラスト要件の対象外。ここで 4.5:1 を超えるようなら
        // 「区切り線が濃すぎる」か「文字色として使う意図が混入した」のどちらかで、
        // どちらも設計意図から外れている。
        expect(contrast(values.rule, values.paper)).toBeLessThan(4.5);
    });
});
