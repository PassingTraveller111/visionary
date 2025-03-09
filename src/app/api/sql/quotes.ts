import {query} from "@/app/api/utils";
import {quotesTableType} from "@/app/api/sql/type";


const getQuoteRandom = async () => {
    return (await query(`SELECT * FROM quotes
                         ORDER BY RAND()
                         LIMIT 1;`)) as [ quotesTableType[]] | null;
}



export const quotes = {
    getQuoteRandom,
};