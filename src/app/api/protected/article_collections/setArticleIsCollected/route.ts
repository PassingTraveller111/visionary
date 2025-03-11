import {NextRequest, NextResponse} from "next/server";
import {article_collections} from "@/app/api/sql/article_collections";

export type setArticleIsCollectedRequestType = {
    userId: number;
    articleId: number;
    isCollected: boolean;
}

export type setArticleIsCollectedResponseType = {
    msg: 'success';
    data: {
        isCollected: 0 | 1;
    };
} | {
    msg: 'error';
}

export async function POST(req: NextRequest) {
    try {
        const data: setArticleIsCollectedRequestType = await req.json();
        const {
            userId,
            articleId,
            isCollected,
        } = data;
        if(isCollected) {
            const results = await article_collections.insertArticleCollection(userId, articleId);
            if (results) {
                const [{ insertId }] = results;
                if(insertId) return NextResponse.json({
                    msg: 'success',
                    data: {
                        isCollected: 1,
                    }
                }, { status: 200 });
            }
        } else {
            const results = await article_collections.deleteArticleCollection(userId, articleId);
            if (results) {
                return NextResponse.json({
                    msg: 'success',
                    data: {
                        isCollected: 0,
                    }
                }, { status: 200 });
            }
        }
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}