/** `SectionHeading` の props。 */
export interface SectionHeadingProps {
    /** セクションの見出し文字列。`navbar_data` の各表示名がそのまま入る */
    title: string;
    /** 右端に出す件数。`undefined` なら件数そのものを描画しない */
    count?: number;
}

/**
 * セクションの見出し。章タイトルと罫線を横並びにし、右端へ件数を置く。
 *
 * **この罫線がセクションの区切りを兼ねる**（`globals.css` の `.section-heading`）。
 * `<section>` 側に `border-t` を足すと、余白を挟んで横罫が 2 本並び、どちらが区切りなのか
 * 読めなくなる。
 *
 * issue #153 で抽出した。About / Career / Product / Articles / Contact の 5 箇所が
 * 同じマークアップを繰り返しており、見出しの体裁を変えるたびに 5 箇所を直す必要があった。
 *
 * **件数は「0 件のときに 0 を出す」。** `count` を渡すかどうかで出し分ける設計にしてあり、
 * 件数の概念があるセクション（Career / Product / Articles）では 0 件でも `0` と出る。
 * 件数の概念が無いセクション（About / Contact）は `count` を渡さない。
 */
export function SectionHeading({ title, count }: SectionHeadingProps) {
    return (
        <div className="section-heading">
            <h2 className="font-serif text-lg font-bold tracking-widest text-ink">{title}</h2>
            <hr />
            {count !== undefined && (
                <span className="font-mono text-[10px] text-mute">{count}</span>
            )}
        </div>
    );
}
