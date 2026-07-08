import {NextResponse} from "next/server";
import {getQuoteRandom} from "@/app/api/services/quote";

export type { getQuoteRandomResponseType } from "@/app/api/services/quote";

export async function GET(){
    const data = await getQuoteRandom();
    if(data) return NextResponse.json({ msg: 'success', data }, { status: 200 });
    return NextResponse.json({ msg: 'error' }, { status: 400 });
}
