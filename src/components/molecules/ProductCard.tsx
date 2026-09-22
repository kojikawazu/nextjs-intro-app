import { cn } from '@/utils/cn';

/** `ProductCard` の props。 */
export interface ProductCardProps {
    /** プロダクト名 */
    title: string;
    /** 概要説明 */
    description: string;
    /** 公開中のサイト URL。空文字ならリンクを描画しない */
    siteUrl: string;
    /** リポジトリ URL。空文字ならリンクを描画しない */
    repoUrl: string;
    /** 使用技術一覧。分類はせずそのまま並べる */
    techStack: string[];
    /** 追加クラス */
    className?: string;
}

/**
 * 外部リンク 1 件分の表示情報。リンク行の組み立てを 1 箇所にまとめるための内部型。
 *
 * 表示ラベル（`site`）と読み上げ語（`サイト`）を**同じ要素に持たせる**。ラベルから
 * 読み上げ語を導こうとすると `label === 'site' ? …` のような文字列比較の分岐になり、
 * リンクを 1 種類足すたびに分岐と配列の 2 箇所を直す必要が出る。
 */
interface ProductLink {
    /** チップに表示するラベル */
    label: string;
    /** `aria-label` に埋める日本語。`{プロダクト名}の{noun}を開く` の形で使う */
    noun: string;
    /** 遷移先 */
    url: string;
}

/**
 * 個人開発プロダクト 1 件分。
 *
 * `CareerCard` と同じ左罫の体裁で組む。経歴とプロダクトは「何を作ったか」を示す点で
 * 並びの性格が同じであり、別の見せ方にすると読み手が切り替えを強いられるため。
 *
 * **進行中バッジは持たない。** `CareerCard` の左罫の色分けは在籍中の案件を際立たせるための
 * ものだが、個人開発は「いま動いているか」より「何を作ったか」が主題であり、
 * 掲載順（配列順）で意図を表せる。
 *
 * **技術スタックは分類しない。** `groupTechStack`（issue #137）は 1 案件あたり最大 30 件を
 * 捌くための仕組みで、数件しか並ばない個人開発では分類ラベルの方が場所を取る。
 *
 * **スクリーンショットは表示しない。** 判断の根拠は `ProductItem` の JSDoc を参照。
 */
export function ProductCard({
    title,
    description,
    siteUrl,
    repoUrl,
    techStack,
    className,
}: ProductCardProps) {
    // 空文字だけでなく空白のみの URL も未設定として扱う。GCS の JSON は手書きのため、
    // 消したつもりのフィールドにスペースが残るケースが現実に起こりうる。
    const links: ProductLink[] = [
        { label: 'site', noun: 'サイト', url: siteUrl },
        { label: 'repo', noun: 'リポジトリ', url: repoUrl },
    ].filter((link) => link.url.trim() !== '');

    return (
        <article className={cn('border-l-2 border-rule pl-5', className)}>
            <h3 className="mb-3 text-base font-bold leading-relaxed text-ink">{title}</h3>

            <p className="mb-6 text-[13px] leading-loose text-body">{description}</p>

            {techStack.length > 0 && (
                <section className="mb-6">
                    <h4 className="mb-3 border-b border-rule pb-1.5 text-[11px] font-bold tracking-wider text-ink">
                        技術スタック
                    </h4>
                    {/*
                     * 技術名は 1 件ずつチップにする。読点で連ねると「文章」として読まれ、
                     * 個々の技術を拾い読みできない（`CareerCard` と同じ理由）。
                     */}
                    <div className="flex flex-wrap gap-1.5">
                        {techStack.map((item) => (
                            <span
                                key={item}
                                className="rounded-sm bg-panel px-2 py-0.5 text-xs leading-relaxed text-body"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {links.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {links.map((link) => (
                        <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            /*
                             * ラベルは `site` / `repo` の 2 語しかなく、複数のカードに同じ文字が並ぶ。
                             * どのプロダクトのリンクかはリンク文字だけでは伝わらないため、
                             * アクセシブル名にプロダクト名を含める。
                             */
                            aria-label={`${title}の${link.noun}を開く`}
                            className="rounded-sm border border-rule px-2 py-1 font-mono text-[10px] tracking-wide text-mute transition-colors hover:border-field hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            )}
        </article>
    );
}
