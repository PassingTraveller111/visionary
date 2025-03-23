import {user} from "@/app/api/sql/user";
import {NextRequest, NextResponse} from "next/server";
import {verifyToken} from "@/utils/auth";


export type chartDataItemType = {
    date: string; // YYYY-MM-DD
    like_count: number;
    read_count: number;
    collection_count: number;
    comment_count: number;
}
export type getUserStatisticChartReqType = {
    startDate: string; // 开始日期 YYYY-MM-DD
    endDate: string; // 结束日期
}

export type getUserStatisticChartResType = {
    msg: 'success' | 'error';
    data: chartDataItemType[];
}

export async function POST(req: NextRequest) {
    try {
        const data: getUserStatisticChartReqType = await req.json();
        const token =  req.cookies.get('token')?.value ?? '';
        const decode = verifyToken(token);
        const { userId } = decode;
        const res = await user.getUserStatisticChart(userId, data.startDate, data.endDate);
        if(res){
            const [ rows ] = res;
            if(Array.isArray(rows) && rows.length > 0){
                return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'error' }, { status: 500 });
    } catch (error) {
        return NextResponse.json({ msg: 'error', data: error }, { status: 500 });
    }

}