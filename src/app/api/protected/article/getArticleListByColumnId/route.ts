import {NextRequest, NextResponse} from "next/server";
import {getArticleListByColumnId} from "@/app/api/services/article";
import {getOptionalUserId} from "@/app/api/services/auth";

export type { getArticleListByColumnIdReqType, getArticleListByColumnIdResType } from "@/app/api/services/article";

export async function POST(req: NextRequest){
    try {
        const { column_id } = await req.json();
        const data = await getArticleListByColumnId(column_id, getOptionalUserId(req));
        if(data) return NextResponse.json({ msg: 'success', data }, { status: 200 });
        return NextResponse.json({ msg: 'error', data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ msg: 'error', data: error }, { status: 200 });
    }
}
