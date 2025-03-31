import {NextRequest, NextResponse} from "next/server";
import {columns} from "@/app/api/sql/columns";
import {verifyToken} from "@/utils/auth";

export type deleteColumnReqType = {
    column_id: number;
}


export async function POST(req: NextRequest){
    try{
        const data: deleteColumnReqType = await req.json();
        const token = req.cookies.get('token')?.value ?? '';
        const { userId } = verifyToken(token);
        const result = await columns.deleteColumn(data.column_id, userId);
        if(result) {
            return NextResponse.json({ msg: 'success', data: result }, { status: 200 });
        }
        return NextResponse.json({ msg: 'error' }, { status: 500 });
    } catch (e) {
        console.log(e)
        return NextResponse.json({ msg: 'error', data: e }, { status: 500 });

    }
}