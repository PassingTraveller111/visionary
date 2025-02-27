import {NextRequest, NextResponse} from "next/server";
import {articleTableType} from "@/app/api/protected/article/type";
import {article} from "@/app/api/sql/article";

export type getPublishedArticleListRequestType = {
    pageNum: number; // 从0开始
    pageSize: number;
}

export type getPublishedArticleListResponseType = {
    msg: 'success';
    data: publishedItemType[];
    total: number;
    pageNum: number;
    pageSize: number;
} | {
    msg: 'error';
}
export type publishedItemType = Pick<articleTableType, 'id' | 'title' | 'views' | 'review_status' | 'review_id' | 'updated_time' | 'draft_id' | 'is_published' | 'published_time' | 'author_nickname' | 'author_id' | 'summary'>;

export async function POST(req: NextRequest) {
    try {
        const data: getPublishedArticleListRequestType = await req.json();
        const {
            pageNum,
            pageSize,
        } = data;
        // 获取所有公开文章
        const results = await article.getPublishedArticlesList(pageNum, pageSize);
        const total = await article.getPublishedArticleCount();
        if (results && total) {
            const [ rows ] = results;
            const [ [ { recordCounts } ] ] = total;
            return NextResponse.json({
                msg: 'success',
                data: rows,
                total: recordCounts,
            }, { status: 200 });
        }
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}