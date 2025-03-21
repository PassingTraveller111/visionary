import {user} from "@/app/api/sql/user";
import {NextRequest, NextResponse} from "next/server";
import {verifyToken} from "@/utils/auth";


export type statisticDataType = {
    days_count: number;
    articles_count: number;
    likes_count: number;
    collections_count: number;
    looks_count: number;
}

export type getUserStatisticResType = {
    msg: 'success' | 'error';
    data: statisticDataType;
}

export async function GET(req: NextRequest) {
    try {
        const token =  req.cookies.get('token')?.value ?? '';
        const decode = verifyToken(token);
        const { userId } = decode;
        const res = await user.getUserStatistic(userId);
        if(res){
            const [ rows ] = res;
            if(Array.isArray(rows) && rows.length > 0){
                return NextResponse.json({ msg: 'success', data: rows[0] }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'error' }, { status: 500 });
    } catch (error) {
        return NextResponse.json({ msg: 'error', data: error }, { status: 500 });
    }

}