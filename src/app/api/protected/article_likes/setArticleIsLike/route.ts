import {NextRequest, NextResponse} from "next/server";
import {article_likes} from "@/app/api/sql/article_likes";

export type setArticleIsLikeRequestType = {
    userId: number;
    articleId: number;
    isLike: boolean;
}

export type setArticleIsLikeResponseType = {
    msg: 'success';
    data: {
        isLike: boolean;
        like_at: string;
    };
} | {
    msg: 'error';
}

export async function POST(req: NextRequest) {
    try {
        const data: setArticleIsLikeRequestType = await req.json();
        const {
            userId,
            articleId,
            isLike,
        } = data;
        const results = await article_likes.setArticleIsLike(userId, articleId, isLike);
        if (results) {
            return NextResponse.json({
                msg: 'success',
                data: {
                    isLike,
                }
            }, { status: 200 });
        }
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}