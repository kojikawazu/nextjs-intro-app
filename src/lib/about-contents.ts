/** `splitAboutContents` の戻り値。 */
export interface AboutContentsSplit {
    /** Hero の引用パネルへ出す 1 段落。取れなければ `undefined` */
    heroLead: string | undefined;
    /** About セクションに残す段落 */
    aboutParagraphs: string[];
}

/**
 * 自己紹介文を Hero 用のリードと About 用の段落へ分ける。
 *
 * **2 番目の段落（添字 1）だけを Hero へ引き上げる。** 現行の見出し
 * `Solving Problems with Technology` は「何ができる人か」を述べておらず、書体と余白では
 * 解けない。`about_contents[1]`（「専門はバックエンド開発。…」）がすでにその答えを書いて
 * いたため、**新しい文言を足さず既存データの再配置で解いた**（issue #135 の弱点(1) /
 * issue #138 で実装）。
 *
 * 添字 0 と 2 以降は About に残る。要素数が足りない場合も例外にはせず、取れた分だけを返す。
 * 掲載データは GCS の JSON を手書きするため、段落数は将来変わりうる。
 *
 * @param contents - `about_data.about_contents`（段落ごとの配列）
 * @returns Hero へ出すリードと、About に残す段落
 */
export function splitAboutContents(contents: string[]): AboutContentsSplit {
    const [first, heroLead, ...rest] = contents;
    const aboutParagraphs = [first, ...rest].filter(
        (paragraph): paragraph is string => typeof paragraph === 'string',
    );

    return { heroLead, aboutParagraphs };
}
