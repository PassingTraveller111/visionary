import {NextRequest, NextResponse} from "next/server";
import {article_collections} from "@/app/api/sql/article_collections";

export type getArticleIsCollectedRequestType = {
    userId: number;
    articleId: number;
}

export type getArticleIsCollectedResponseType = {
    msg: 'success';
    data: {
        isCollected: 0 | 1;
    };
} | {
    msg: 'error';
}

export async function POST(req: NextRequest) {
    try {
        const data: getArticleIsCollectedRequestType = await req.json();
        const {
            userId,
            articleId,
        } = data;
        const results = await article_collections.getArticleIsCollected(userId, articleId);
        if (results) {
            const [ [ { isCollected } ] ] = results;
            return NextResponse.json({
                msg: 'success',
                data: {
                    isCollected,
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