import { cn } from '@/utils/cn';
import { SNSItem } from '@/types/portfolio';

/** `SocialLinks` の props。 */
export interface SocialLinksProps {
    /** 表示する SNS リンク一覧。並び順はそのまま描画順になる */
    links: SNSItem[];
    /** 追加クラス */
    className?: string;
}

/**
 * SNS プロフィールへのリンクを横並びで表示する。
 *
 * **アイコン画像ではなく名前のテキストで出す。** `sns_img` が指す GCS 上の SVG は
 * 白一色（`github_original_white.svg` / `zenn_original_white.svg`）で、紙のような明るい地の上では
 * 見えなくなる。データは変更しない方針（issue #135）のため、明るい地でも読める表現へ置き換えた。
 * CSS フィルタで反転させる手もあるが、将来データ側が色付きアイコンに差し替わると破綻する。
 *
 * その結果 `sns_img` は画面から参照されなくなる（`career_title_data` / `contact_data` と同じ状態）。
 *
 * 表示は `sns_name` をそのまま使う。データ上は小文字（`github` / `zenn`）だが、
 * 等幅で組むと表記として成立するため大文字化などの加工はしない。
 *
 * 各リンクは別タブで開き、`rel="noopener noreferrer"` を付与して
 * 遷移先から `window.opener` 経由で操作されるのを防ぐ。
 * リンク文字だけでは行き先が伝わりにくいため、`aria-label` に「{SNS名}のプロフィールを開く」を設定している。
 */
export function SocialLinks({ links, className }: SocialLinksProps) {
    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {links.map((link) => (
                <a
                    key={link.sns_url}
                    href={link.sns_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.sns_name}のプロフィールを開く`}
                    className="rounded-sm border border-rule px-2 py-1 font-mono text-[10px] tracking-wide text-mute transition-colors hover:border-field hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
                >
                    {link.sns_name}
                </a>
            ))}
        </div>
    );
}
