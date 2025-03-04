import {NextRequest, NextResponse} from "next/server";
import {article_likes} from "@/app/api/sql/article_likes";

export type getArticleIsLikeRequestType = {
    userId: number;
    articleId: number;
}

export type getArticleIsLikeResponseType = {
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
        const data: getArticleIsLikeRequestType = await req.json();
        const {
            userId,
            articleId,
        } = data;
        const results = await article_likes.getArticleIsLike(userId, articleId);
        if (results) {
            const [ rows ] = results;
            if (Array.isArray(rows) && rows.length >= 1) {
                return NextResponse.json({
                    msg: 'success',
                    data: {
                        isLike: true,
                        like_at: rows[0].like_at,
                    },
                }, { status: 200 });
            } else {
                return NextResponse.json({
                    msg: 'success',
                    data: {
                        isLike: false,
                    }
                })
            }
        }
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}