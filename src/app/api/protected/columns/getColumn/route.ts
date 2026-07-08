import {NextRequest, NextResponse} from "next/server";
import {getColumn} from "@/app/api/services/columns";

export type { getColumnReqType } from "@/app/api/services/columns";

export async function POST(req: NextRequest){
    try{
        const { column_id } = await req.json();
        const data = await getColumn(column_id);
        if(data) return NextResponse.json({ msg: 'success', data }, { status: 200 });
        return NextResponse.json({ msg: 'error', data }, { status: 500 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ msg: 'error', data: error }, { status: 500 });
    }
}
