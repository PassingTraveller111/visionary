import {NextRequest, NextResponse} from "next/server";
import {columns} from "@/app/api/sql/columns";

export type getColumnReqType = {
    column_id: number;
}


export async function POST(req: NextRequest){
    try{
        const data: getColumnReqType = await req.json();
        const result = await columns.getColumn(data.column_id);
        if(result) {
            const [ rows ] = result;
            if(Array.isArray(rows) && rows.length > 0){
                return NextResponse.json({ msg: 'success', data: rows[0] }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'error', data: result }, { status: 500 });
    } catch (e) {
        console.log(e)
        return NextResponse.json({ msg: 'error', data: e }, { status: 500 });

    }
}