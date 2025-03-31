import {NextRequest, NextResponse} from "next/server";
import {columns} from "@/app/api/sql/columns";
// import {verifyToken} from "@/utils/auth";
import {columnsTableType} from "@/app/api/sql/type";

export type getColumnsByUserIdReqType = {
    userId: number;
}

export type getColumnsByUserIdResType = {
    msg: 'success' | 'error',
    data: columnsTableType[],
}

export async function POST(req: NextRequest){
    try {
        const data: getColumnsByUserIdReqType = await req.json();
        // const token = req.cookies.get('token')?.value ?? '';
        // const { userId } = verifyToken(token);
        const result = await columns.getColumnsByUserId(data.userId);
        if (result) {
            const [ rows ] = result;
            if(Array.isArray(rows)){
                return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'error', data: result }, { status: 500 });
    } catch (e) {
        return NextResponse.json({ msg: 'error', data: e }, { status: 500 });
    }
}