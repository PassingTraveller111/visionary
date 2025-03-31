import {NextRequest, NextResponse} from "next/server";
import {columns} from "@/app/api/sql/columns";
import {verifyToken} from "@/utils/auth";

export type updateColumnReqType = {
    column_id?: number; // 存在是更新，不存在是新建
    column_name: string;
    cover_image?: string;
    description: string;
}



export async function POST(req: NextRequest){
    try{
        const data: updateColumnReqType = await req.json();
        const token = req.cookies.get('token')?.value ?? '';
        const { userId } = verifyToken(token);
        if (data.column_id) {

        } else {
            // 新建
            const result = await columns.insertColumn(data.column_name, userId, data.description, data.cover_image);
            if(result){
                const [ { insertId } ] = result;
                return NextResponse.json({ msg: 'success', data: { insertId } }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'error' }, { status: 500 });
    } catch (e) {
        console.log(e)
        return NextResponse.json({ msg: 'error', data: e }, { status: 500 });

    }
}