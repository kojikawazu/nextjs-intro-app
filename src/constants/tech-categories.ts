import type { TechCategory } from '@/types/tech-category';

/**
 * 分類の画面表示名。
 *
 * GCS の JSON には分類の概念が無く、対応表をフロント側に持つしかないため
 * （データを変更しない方針。issue #135）、ラベルもここで持つ。
 * 全環境で不変な値のため `constants/` に置いてよい。
 */
export const TECH_CATEGORY_LABELS: Readonly<Record<TechCategory, string>> = {
    language: '言語',
    framework: 'フレームワーク',
    platform: 'OS・ミドルウェア',
    testing: 'テスト',
    infrastructure: '基盤・CI',
    ai: 'AI 活用',
    design: '設計',
    collaboration: '協働ツール',
    other: 'その他',
};

/**
 * 技術名 → 分類の対応表。
 *
 * **キーは `career_skill_stack` に現れる文字列そのまま。** `Java8/5` `Tomcat9/5.5`
 * `Miracle Linux5~8` のようにバージョン表記が混ざるが、データを変更しない方針のため
 * 正規化せず実際の値をキーにしている。照合時の大文字小文字は
 * `lib/group-tech-stack.ts` が吸収する。
 *
 * **`other` はここに書かない。** 対応表に無いものが `other` へ落ちる仕組みであり、
 * 明示的に `other` を割り当てる技術は存在しない。
 *
 * ---- 判断が分かれた項目 ----
 * - `jsp`: Java のテンプレート構文のため `language`。`framework` ではない
 * - `Tomcat*`: アプリケーションサーバなので `platform`。`framework` ではない
 * - `Maven`: ビルドツールのため `infrastructure`。`framework` ではない
 * - `VMWare`: 仮想化基盤のため `infrastructure`
 * - `OpenStreetMap`: 地図データの提供元だが、`OpenLayers3` と対で使う描画側の
 *   依存として扱い `framework` に寄せた
 * - `Git`: バージョン管理のため `collaboration`（`GitHub` / `GitLab` / `SVN` と同じ枠）
 * - `グラフィックMW`: 名前のとおりミドルウェアのため `platform`
 *
 * ---- 運用上の注意 ----
 * GCS の JSON に新しい技術が追加されても、この表に無ければ**実行時に黙って
 * `other` へ落ちる**。テストはコミット時点のスナップショットしか見ないため検出できない。
 * データを更新したらこの表も更新すること（詳細は `docs/05-data-specification.md`）。
 */
export const TECH_CATEGORY_BY_NAME: Readonly<Record<string, TechCategory>> = {
    // --- 言語 ---
    'C++11': 'language',
    C言語: 'language',
    Java8: 'language',
    'Java8/5': 'language',
    Java11: 'language',
    JavaScript: 'language',
    PHP: 'language',
    Python2: 'language',
    Python3: 'language',
    ShellScript: 'language',
    TypeScript: 'language',
    bash: 'language',
    bat: 'language',
    jsp: 'language',

    // --- フレームワーク ---
    Django: 'framework',
    Laravel: 'framework',
    NestJS: 'framework',
    'Nuxt.js': 'framework',
    OpenLayers3: 'framework',
    OpenStreetMap: 'framework',
    'Ruby on Rails': 'framework',
    SpringBoot: 'framework',
    Struts: 'framework',
    'Zend framework': 'framework',

    // --- OS・ミドルウェア ---
    'Amazon Linux2': 'platform',
    'CentOS6.8': 'platform',
    'CentOS7.4': 'platform',
    Keycloak: 'platform',
    'Miracle Linux5~8': 'platform',
    'NFSv3~4': 'platform',
    NGINX: 'platform',
    OpenSSL: 'platform',
    PostgreSQL: 'platform',
    'Samba3~4': 'platform',
    Tomcat9: 'platform',
    'Tomcat9/5.5': 'platform',
    Tomcat10: 'platform',
    'Ubuntu20.04': 'platform',
    WSL: 'platform',
    Windows7: 'platform',
    WindowsServer: 'platform',
    chronyd: 'platform',
    iptables: 'platform',
    network: 'platform',
    ntpd: 'platform',
    グラフィックMW: 'platform',

    // --- テスト ---
    Jest: 'testing',
    Playwright: 'testing',
    Vitest: 'testing',

    // --- 基盤・CI ---
    AWS: 'infrastructure',
    Docker: 'infrastructure',
    'Docker Compose': 'infrastructure',
    'GitHub Actions': 'infrastructure',
    Jenkins: 'infrastructure',
    Maven: 'infrastructure',
    VMWare: 'infrastructure',
    harness: 'infrastructure',

    // --- AI 活用 ---
    Claude: 'ai',
    Gemini: 'ai',
    'GitHub Copilot': 'ai',
    'M365 Copilot': 'ai',
    Ollama: 'ai',
    OpenAI: 'ai',

    // --- 設計 ---
    'Clean Architecture': 'design',
    DDD: 'design',
    PlantUML: 'design',

    // --- 協働ツール ---
    Cacoo: 'collaboration',
    Confluence: 'collaboration',
    Eclipse: 'collaboration',
    Git: 'collaboration',
    GitHub: 'collaboration',
    GitLab: 'collaboration',
    'Google Docs': 'collaboration',
    'Google meet': 'collaboration',
    JIRA: 'collaboration',
    Outlook: 'collaboration',
    RedMine: 'collaboration',
    SVN: 'collaboration',
    Slack: 'collaboration',
    Teams: 'collaboration',
    VSCode: 'collaboration',
    vim: 'collaboration',
};
