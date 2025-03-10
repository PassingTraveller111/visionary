import {NextRequest, NextResponse} from "next/server";
import {articleTableType} from "@/app/api/protected/article/type";
import {article} from "@/app/api/sql/article";

export type getArticleListByKeyWordRequestType = {
    pageNum: number; // 从0开始
    pageSize: number;
    keyword: string;
}

export type getArticleListByKeyWordResponseType = {
    msg: 'success';
    data: ItemType[];
    total: number;
    pageNum: number;
    pageSize: number;
} | {
    msg: 'error';
}
export type ItemType = Pick<articleTableType, 'id' | 'title' | 'review_status' | 'review_id' | 'updated_time' | 'draft_id' | 'is_published' | 'published_time' | 'author_nickname' | 'author_id' | 'summary'>
    & {
        like_count: number;
        look_count: number;
    };

export async function POST(req: NextRequest) {
    try {
        const data: getArticleListByKeyWordRequestType = await req.json();
        const {
            pageNum,
            pageSize,
            keyword,
        } = data;
        // 获取所有公开文章
        const results = await article.getArticleListByKeyWord(keyword, pageNum, pageSize);
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