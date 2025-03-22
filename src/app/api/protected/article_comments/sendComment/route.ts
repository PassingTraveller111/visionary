import {NextRequest, NextResponse} from "next/server";
import {article_comments} from "@/app/api/sql/article_comments";

export type sendCommentReqType = {
    userId: number;
    articleId: number;
    commentText: string;
    parentCommentId?: number;
}

export async function POST(req: NextRequest){
    try {
        const data: sendCommentReqType = await req.json();
        const res = await article_comments.sendArticleComment(data.userId, data.articleId, data.commentText, data.parentCommentId);
        return NextResponse.json({ msg: 'success', data: res }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: 'error', data: error });
    }
}