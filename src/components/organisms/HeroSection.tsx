import type { CareerSummary } from '@/lib/career-summary';

/** `HeroSection` の props。 */
export interface HeroSectionProps {
    /** 見出し直下の引用パネルに出すリード文。無ければパネルごと描画しない */
    lead?: string;
    /** 実績バンドに出す集計値 */
    summary: CareerSummary;
}

/**
 * ページ先頭のヒーロー。見出し → 具体 → 数値帯 の 3 段で構成する。
 *
 * 上下余白は他セクション（`.section-padding`）より 1 段広く取る。先頭であり、ヘッダーの
 * 罫線との間を詰めると見出しがヘッダーに貼り付いて見えるため。
 *
 * **見出しの文字列はハードコードしている。** GCS の `hero_data` は背景画像の URL しか持たず、
 * キャッチコピーはデータ側に無い（`docs/05-data-specification.md` 参照）。
 *
 * 唯一 `<section>` に `id` を持たないセクションでもある。ナビゲーションの遷移先にならず、
 * ページ先頭そのものがヒーローの位置になるため。
 */
export function HeroSection({ lead, summary }: HeroSectionProps) {
    return (
        <section className="container animate-fade-in-up py-10 lg:py-14">
            {/*
             * 折り返しは <br /> ではなく幅で作る。<br /> を挟むとテキストノードが分かれ、
             * 見出しのアクセシブル名が「Solving Problemswith Technology」になりうる。
             * e2e/home.spec.ts と error.spec.ts がこの名前で見出しを特定している。
             */}
            <h1 className="max-w-[17ch] font-serif text-[28px] font-bold leading-snug tracking-wide text-ink sm:text-[34px]">
                Solving Problems with Technology
            </h1>

            {lead && <p className="quote-panel mt-8 text-sm leading-loose">{lead}</p>}

            {/*
             * 縦罫は引かない。上下の罫線と余白だけで 3 つの数値は分かれて読める。
             *
             * 等分した列（1 セル 277px）に対し中身は数十 px しかなく、縦罫が中身から
             * 200px も離れて「何を区切っているのか」が読めない線になっていた。
             * 仕事をしていない線は引くより消す。
             *
             * セル内側の余白も持たせない。持たせると「7」が本文マージンから内側へずれ、
             * h1・引用・下の見出しと左端の縦ラインが通らなくなる。
             */}
            <dl className="mt-8 grid grid-cols-3 border-y border-rule">
                <div className="py-4">
                    <dd className="font-serif text-2xl font-bold leading-none text-ink">
                        {summary.projectCount}
                    </dd>
                    <dt className="mt-2 text-[10px] text-mute">プロジェクト</dt>
                </div>
                <div className="py-4">
                    <dd className="font-serif text-2xl font-bold leading-none text-ink">
                        {summary.technologyCount}
                    </dd>
                    <dt className="mt-2 text-[10px] text-mute">使用技術</dt>
                </div>
                <div className="py-4">
                    <dd className="font-serif text-2xl font-bold leading-none text-ink">
                        {summary.startYear ?? '—'}
                    </dd>
                    <dt className="mt-2 text-[10px] text-mute">経歴開始</dt>
                </div>
            </dl>
        </section>
    );
}
