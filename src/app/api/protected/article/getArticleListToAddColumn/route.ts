import {NextRequest, NextResponse} from "next/server";
import {article} from "@/app/api/sql/article";
import {verifyToken} from "@/utils/auth";


export type getArticleListToAddColumnResType = {
    msg: 'success' | 'error';
    data: {
        id: number;
        title: string;
        updated_time: string;
    }[]
}

export async function POST(req: NextRequest){
    try {
        const token = req.cookies.get('token')?.value ?? '';
        const { userId } = verifyToken(token);
        const result = await article.getArticleToAddColumn(userId);
        if(result){
            const [ rows ] = result;
            if(Array.isArray(rows)){
                return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'error', data: result, status: 500 });
    } catch (e) {
        return NextResponse.json({ msg: "error", data: e }, { status: 500 });
    }
}