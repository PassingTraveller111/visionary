import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";
import {articleTableType} from "@/app/api/protected/article/type";

export type getArticleListRequestType = {
    authorId: number;
}
export type getArticleListResponseType = {
    msg: 'success' | 'error';
    data: itemType[];
}
export type itemType = Pick<articleTableType, 'id' | 'title' | 'review_status' | 'review_id' | 'updated_time' | 'draft_id' | 'is_published' | 'published_time'>;

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        const { userId } = decode;
        const data: getArticleListRequestType = await req.json();
        const isOwn = userId === data.authorId;
        let sql, values: unknown[];
        if (isOwn) {
            sql = `SELECT id, title, review_status, review_id, updated_time, draft_id, is_published, published_time FROM articles WHERE author_id = ? ORDER BY updated_time DESC`;
            values = [data.authorId];
        } else {
            // 非本人，过滤未公开文章
            sql = `SELECT id, title, review_status, review_id, updated_time, draft_id, is_published, published_time
                   FROM articles 
                   WHERE author_id = ? And is_published = 1
                   ORDER BY updated_time DESC`;
            values = [data.authorId];
        }
        const [ rows ] = await connection.execute(sql, values);
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