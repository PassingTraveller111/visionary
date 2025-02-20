import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {articleTableType} from "@/app/api/protected/article/type";

export type getPublishedArticleListRequestType = {
    page: number; // 从0开始
    limit: number;
}

export type getPublishedArticleListResponseType = {
    msg: 'success' | 'error';
    data: publishedItemType[];
}
export type publishedItemType = Pick<articleTableType, 'id' | 'title' | 'views' | 'review_status' | 'review_id' | 'updated_time' | 'draft_id' | 'is_published' | 'published_time' | 'author_nickname' | 'author_id' | 'summary'>;

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const data: getPublishedArticleListRequestType = await req.json();
        const page = parseInt(String(data.page), 10);
        const limit = parseInt(String(data.limit), 10);
        const offset = page * limit;
        // 获取所有公开文章
        const sql = `SELECT id, title, views, review_status, review_id, updated_time, draft_id, is_published, published_time, author_nickname, author_id, summary
                     FROM articles
                     WHERE is_published = 1
                     ORDER BY updated_time DESC
                     LIMIT 10 
                     OFFSET 0`;
        const values = [limit, offset];
        const [rows] = await connection.execute(sql, values);
        return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}