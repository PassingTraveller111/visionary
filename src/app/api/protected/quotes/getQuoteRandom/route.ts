import {NextResponse} from "next/server";
import {quotes} from "@/app/api/sql/quotes";
import {quotesTableType} from "@/app/api/sql/type";


export type getQuoteRandomResponseType = {
    msg: 'success',
    data: quotesTableType,
} | {
    msg: 'error';
}

export async function GET(){
    const result = await quotes.getQuoteRandom();
    if(result){
        const [ rows ] = result;
        if(Array.isArray(rows) && rows.length > 0){
            return NextResponse.json({ msg: 'success', data: rows[0] }, { status: 200 });
        }
    }
    return NextResponse.json({ msg: 'error' }, { status: 400 });
}