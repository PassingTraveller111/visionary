import {quotes} from "@/app/api/sql/quotes";
import {quotesTableType} from "@/app/api/sql/type";

export type getQuoteRandomResponseType = {
    msg: 'success',
    data: quotesTableType,
} | {
    msg: 'error';
}

export const getQuoteRandom = async () => {
    const result = await quotes.getQuoteRandom();
    if (!result) return null;
    const [ rows ] = result;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}
