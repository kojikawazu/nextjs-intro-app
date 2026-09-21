import { describe, it, expect } from 'vitest';
import { TECH_CATEGORY_BY_NAME } from '@/constants/tech-categories';
import { TECH_CATEGORIES } from '@/types/tech-category';
import { groupTechStack } from './group-tech-stack';

/**
 * GCS の `career_skill_stack` に実在する技術名の全件（ユニーク 82 / 延べ 113）。
 *
 * **コミット時点のスナップショット。** データ側に技術が追加されてもこの配列は変わらないため、
 * このテストは「いま存在する技術がすべて分類に載っていること」しか保証しない。
 * 新技術の取りこぼしは実行時に黙って `other` へ落ちる（`docs/05` に運用上の注意として記載）。
 */
const REAL_TECH_NAMES = [
    'AWS',
    'Amazon Linux2',
    'C++11',
    'Cacoo',
    'CentOS6.8',
    'CentOS7.4',
    'Claude',
    'Clean Architecture',
    'Confluence',
    'C言語',
    'DDD',
    'Django',
    'Docker',
    'Docker Compose',
    'Eclipse',
    'Gemini',
    'Git',
    'GitHub',
    'GitHub Actions',
    'GitHub Copilot',
    'GitLab',
    'Google Docs',
    'Google meet',
    'JIRA',
    'Java11',
    'Java8',
    'Java8/5',
    'JavaScript',
    'Jenkins',
    'Jest',
    'Keycloak',
    'Laravel',
    'M365 Copilot',
    'Maven',
    'Miracle Linux5~8',
    'NFSv3~4',
    'NGINX',
    'NestJS',
    'Nuxt.js',
    'Ollama',
    'OpenAI',
    'OpenLayers3',
    'OpenSSL',
    'OpenStreetMap',
    'Outlook',
    'PHP',
    'PlantUML',
    'Playwright',
    'PostgreSQL',
    'Python2',
    'Python3',
    'RedMine',
    'Ruby on Rails',
    'SVN',
    'Samba3~4',
    'ShellScript',
    'Slack',
    'SpringBoot',
    'Struts',
    'Teams',
    'Tomcat10',
    'Tomcat9',
    'Tomcat9/5.5',
    'TypeScript',
    'Ubuntu20.04',
    'VMWare',
    'VSCode',
    'Vitest',
    'WSL',
    'Windows7',
    'WindowsServer',
    'Zend framework',
    'bash',
    'bat',
    'chronyd',
    'harness',
    'iptables',
    'jsp',
    'network',
    'ntpd',
    'vim',
    'グラフィックMW',
] as const;

/** 最新案件（美容系口コミサイトの AI 駆動開発）の技術スタック 29 件。並びはデータのまま。 */
const LATEST_CAREER_STACK = [
    'TypeScript',
    'Nuxt.js',
    'NestJS',
    'Ruby on Rails',
    'PHP',
    'Laravel',
    'Zend framework',
    'GitHub',
    'GitLab',
    'GitHub Copilot',
    'Claude',
    'Gemini',
    'Jest',
    'Vitest',
    'Playwright',
    'Docker',
    'Docker Compose',
    'GitHub Actions',
    'AWS',
    'Confluence',
    'JIRA',
    'Google Docs',
    'VSCode',
    'WSL',
    'Slack',
    'Google meet',
    'Cacoo',
    'Clean Architecture',
    'DDD',
] as const;

/**
 * 結果を「分類 → 技術名の配列」の素朴なオブジェクトへ畳む。
 *
 * @param stack - `groupTechStack` に渡す技術名
 * @returns 分類をキー、技術名の配列を値とするオブジェクト
 */
function groupedAsRecord(stack: readonly string[]): Record<string, string[]> {
    return Object.fromEntries(groupTechStack(stack).map((group) => [group.category, group.items]));
}

describe('groupTechStack', () => {
    // --- 正常系 ---
    it('最新案件の 29 件を 8 分類へ正しく分ける', () => {
        // WSL は Windows Subsystem for Linux であり協働ツールではないため platform に入る。
        // 「Linux を触れる人か」は採用担当者にとって信号になるので、埋もれさせない。
        expect(groupedAsRecord(LATEST_CAREER_STACK)).toEqual({
            language: ['TypeScript', 'PHP'],
            framework: ['Nuxt.js', 'NestJS', 'Ruby on Rails', 'Laravel', 'Zend framework'],
            platform: ['WSL'],
            testing: ['Jest', 'Vitest', 'Playwright'],
            infrastructure: ['Docker', 'Docker Compose', 'GitHub Actions', 'AWS'],
            ai: ['GitHub Copilot', 'Claude', 'Gemini'],
            design: ['Clean Architecture', 'DDD'],
            collaboration: [
                'GitHub',
                'GitLab',
                'Confluence',
                'JIRA',
                'Google Docs',
                'VSCode',
                'Slack',
                'Google meet',
                'Cacoo',
            ],
        });
    });

    it('分類の並びが TECH_CATEGORIES の定義順になる', () => {
        const order = groupTechStack(LATEST_CAREER_STACK).map((group) => group.category);

        expect(order).toEqual([
            'language',
            'framework',
            'platform',
            'testing',
            'infrastructure',
            'ai',
            'design',
            'collaboration',
        ]);
        // 定義順の部分列であること（並べ替えが起きていない）。
        const indexes = order.map((category) => TECH_CATEGORIES.indexOf(category));
        expect(indexes).toEqual(indexes.slice().sort((a, b) => a - b));
    });

    // --- 準正常系（想定内の入力バリエーション）---
    it('対応表に無い技術は other へ落とす', () => {
        expect(groupedAsRecord(['TypeScript', 'COBOL'])).toEqual({
            language: ['TypeScript'],
            other: ['COBOL'],
        });
    });

    it('中身のない分類は結果に含めない', () => {
        const categories = groupTechStack(['TypeScript']).map((group) => group.category);

        expect(categories).toEqual(['language']);
    });

    it('分類内の並びは入力順を保つ', () => {
        expect(groupedAsRecord(['Python3', 'bash', 'TypeScript'])).toEqual({
            language: ['Python3', 'bash', 'TypeScript'],
        });
    });

    it('大文字小文字が違っても同じ分類になる', () => {
        expect(groupedAsRecord(['typescript'])).toEqual({ language: ['typescript'] });
        expect(groupedAsRecord(['NUXT.JS'])).toEqual({ framework: ['NUXT.JS'] });
    });

    it('前後に空白がある技術名を扱える（表示からも空白を落とす）', () => {
        expect(groupedAsRecord(['  TypeScript  '])).toEqual({ language: ['TypeScript'] });
    });

    it('画面表示用のラベルを分類ごとに返す', () => {
        expect(groupTechStack(['TypeScript', 'Docker']).map((group) => group.label)).toEqual([
            '言語',
            '基盤・CI',
        ]);
    });

    // --- 異常系（想定外の入力でも安全に失敗する）---
    it('空配列は空配列を返す', () => {
        expect(groupTechStack([])).toEqual([]);
    });

    it('重複した技術名は最初の 1 件だけ残す', () => {
        expect(groupedAsRecord(['Docker', 'Docker'])).toEqual({ infrastructure: ['Docker'] });
    });

    it('大文字小文字違いの重複も 1 件にまとめる', () => {
        expect(groupedAsRecord(['Docker', 'docker', 'DOCKER'])).toEqual({
            infrastructure: ['Docker'],
        });
    });

    it('空文字・空白のみの要素は捨てる', () => {
        expect(groupTechStack(['', '   ', '\t'])).toEqual([]);
    });

    it('文字列以外が混ざっても落ちずに無視する', () => {
        // 外部データ（GCS の JSON）由来のため、型が保証されない入力が来うる。
        const dirty = ['TypeScript', null, undefined, 42, {}] as unknown as string[];

        expect(groupedAsRecord(dirty)).toEqual({ language: ['TypeScript'] });
    });

    it('すべて未登録なら other 1 分類だけを返す', () => {
        expect(groupTechStack(['COBOL', 'Fortran']).map((group) => group.category)).toEqual([
            'other',
        ]);
    });
});

describe('実データの網羅性', () => {
    // --- 正常系 ---
    it('実在する 82 技術がすべて分類に載っている（other が 0 件）', () => {
        const other = groupTechStack(REAL_TECH_NAMES).find((group) => group.category === 'other');

        // 失敗時に「どの技術が漏れたか」が出るよう、件数ではなく中身を比較する。
        expect(other?.items ?? []).toEqual([]);
    });

    // --- 準正常系（対応表そのものの整合性）---
    it('対応表のキー数と実データのユニーク数が一致する', () => {
        expect(Object.keys(TECH_CATEGORY_BY_NAME)).toHaveLength(REAL_TECH_NAMES.length);
    });

    it('対応表に実データへ存在しないキーが混ざっていない', () => {
        const real = new Set<string>(REAL_TECH_NAMES);
        const stale = Object.keys(TECH_CATEGORY_BY_NAME).filter((name) => !real.has(name));

        expect(stale).toEqual([]);
    });

    // --- 異常系（分類の設計意図が崩れていないこと）---
    it('対応表に other を直接割り当てていない（other は受け皿専用）', () => {
        const assignedToOther = Object.entries(TECH_CATEGORY_BY_NAME)
            .filter(([, category]) => category === 'other')
            .map(([name]) => name);

        expect(assignedToOther).toEqual([]);
    });

    it('すべての分類が 1 件以上の技術を持つ（使われない分類を作らない）', () => {
        const used = new Set(Object.values(TECH_CATEGORY_BY_NAME));
        const unused = TECH_CATEGORIES.filter(
            (category) => category !== 'other' && !used.has(category),
        );

        expect(unused).toEqual([]);
    });
});
