import {query} from "@/server/db/query";
import {quotesTableType} from "@/server/sql/type";


const getQuoteRandom = async () => {
    return (await query(`SELECT * FROM quotes
                         ORDER BY RAND()
                         LIMIT 1;`)) as [ quotesTableType[]] | null;
}



export const quotes = {
    getQuoteRandom,
};
