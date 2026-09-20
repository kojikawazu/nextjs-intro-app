/**
 * 年月を日付に変換
 * @param yearMonth "YYYY年MM月" -> "YYYY/MM/DD"
 * @returns "YYYY/MM/01"
 */
export function toDateString(yearMonth: string): string {
    const match = yearMonth.match(/(\d{4})年(\d{1,2})月/);
    if (!match) throw new Error(`Invalid format: ${yearMonth}`);

    const year = match[1];
    const month = match[2].padStart(2, '0');

    return `${year}/${month}/01`;
}
