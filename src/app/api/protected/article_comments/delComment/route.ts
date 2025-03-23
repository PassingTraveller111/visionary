import {NextRequest, NextResponse} from "next/server";
import {article_comments} from "@/app/api/sql/article_comments";
import {verifyToken} from "@/utils/auth";

export type delCommentReqType = {
    comment_id: number,
}

export type delCommentResType ={
    msg: 'success' | 'error';
}
export async function POST (req: NextRequest) {
    try {
        const data: delCommentReqType = await req.json();
        const token = req.cookies.get('token')?.value ?? '';
        const { userId } = verifyToken(token);
        const res = await article_comments.deleteComment(data.comment_id, userId);
        return NextResponse.json({msg: 'success', data: res});
    } catch (e) {
        console.log(e);
        return NextResponse.json({ msg: 'error', data: e }, { status: 500 });
    }
}