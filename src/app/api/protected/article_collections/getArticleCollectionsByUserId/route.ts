import {NextRequest, NextResponse} from "next/server";
import {article_collections} from "@/app/api/sql/article_collections";
import {article_collectionsTableType, articleTableType} from "@/app/api/sql/type";

export type getArticleCollectionsByUserIdRequestType = {
    userId: number;
}

export type getArticleCollectionsByUserIdResponseType = {
    msg: 'success' | 'error';
    data: (Pick<article_collectionsTableType, 'article_id' | 'collect_time'> & Pick<articleTableType, 'title' | 'tags' | 'summary' | 'cover'>
        & { author_name: string, like_count: number, look_count: number })[];
}

export async function POST(req: NextRequest) {
    try {
        const data: getArticleCollectionsByUserIdRequestType = await req.json();
        const {
            userId,
        } = data;
        const results = await article_collections.getArticleCollectionsByUserId(userId);
        if (results) {
            const [ rows ] = results;
            return NextResponse.json({
                msg: 'success',
                data: rows,
            }, { status: 200 });
        }
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}