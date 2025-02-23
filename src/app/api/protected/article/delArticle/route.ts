import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {PoolConnection} from "mysql2/promise";
import redis from "@/lib/redis";
import {getArticleKey, getDraftKey} from "@/app/api/redisKeys";

export type updateDataType = {
    articleId: number;
}

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const data: updateDataType = await req.json();
        // 查找该文章的草稿id
        const draft_id = await getDraftId(data.articleId, connection);
        // 删除文章
        await delArticle(data.articleId, connection);
        await delDraftId(draft_id, connection);
        return NextResponse.json({ msg: 'success', data: '删除成功' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

const getDraftId = async (articleId: number, connection: PoolConnection) => {
    const cacheData = await redis.get(getArticleKey(articleId));
    if (cacheData && JSON.parse(cacheData).draft) {
        return JSON.parse(cacheData).draft;
    }
    const sql = `SELECT draft_id FROM articles WHERE id = ?`;
    const [ rows ] = await connection.execute(sql, [articleId]);
    if (Array.isArray(rows) && rows.length > 0) {
        return (rows[0] as { draft_id: number }).draft_id;
    }
    return 0
}
const delArticle = async (article_id: number, connection: PoolConnection) => {
    const sql = `DELETE FROM articles WHERE id = ?;`;
    await connection.execute(sql, [article_id]);
    await redis.del(getArticleKey(article_id));
}

const delDraftId = async (draft_id: number, connection: PoolConnection) => {
    const sql = `DELETE FROM drafts WHERE id = ?;`;
    await connection.execute(sql, [draft_id]);
    await redis.del(getDraftKey(draft_id));
}