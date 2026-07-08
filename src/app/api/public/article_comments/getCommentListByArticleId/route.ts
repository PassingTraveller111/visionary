import {NextRequest, NextResponse} from "next/server";
import {getCommentListByArticleId} from "@/app/api/services/comment";

export type { commentItem, getCommentListByArticleIdReqType, getCommentListByArticleIdResType, userInfoType } from "@/app/api/services/comment";

export async function POST(req: NextRequest) {
    try {
        const { article_id } = await req.json();
        const data = await getCommentListByArticleId(article_id);
        return NextResponse.json({ msg: 'success', data }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: 'error', data: error }, { status: 200 });
    }
}
