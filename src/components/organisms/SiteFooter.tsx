/** `SiteFooter` の props。 */
export interface SiteFooterProps {
    /** コピーライト表記（`footer_data.copyright`） */
    copyright: string;
    /** 右端に出すサイト名（`navbar_data.link_title`） */
    siteTitle: string;
}

/**
 * ページ末尾のフッター。
 *
 * **ここだけ上罫で区切る。** 他のセクションは `SectionHeading` の罫線が区切りを兼ねるが、
 * フッターは見出しを持たないため、自前で境界を引かないと本文と地続きに見える。
 *
 * 名前を `Footer` ではなく `SiteFooter` にしているのは、`<footer>` 要素や将来のセクション内
 * フッターと取り違えないため。
 */
export function SiteFooter({ copyright, siteTitle }: SiteFooterProps) {
    return (
        <footer className="border-t border-rule">
            <div className="container flex h-16 items-center justify-between font-mono text-[10px] text-mute">
                <span>{copyright}</span>
                <span>{siteTitle}</span>
            </div>
        </footer>
    );
}
