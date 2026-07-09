import {quotes} from "@/server/sql/quotes";
import type {QuoteDto} from "@/shared/api/quotes";

export const getQuoteRandom = async (): Promise<QuoteDto | null> => {
    const result = await quotes.getQuoteRandom();
    if (!result) return null;

    const [ rows ] = result;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}
