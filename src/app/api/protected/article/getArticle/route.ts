import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { articleTableType } from "@/app/api/protected/article/type";

export type getArticleRequestType = {
    articleId: number;
}

export type getArticleResponseType = {
    msg: 'success' | 'error';
    data: articleTableType;
}

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const data: getArticleRequestType = await req.json();
        const sql = `SELECT * FROM articles WHERE id = ?`;
        const values = [data.articleId];
        const [ rows ] = await connection.execute(sql, values);
        if(Array.isArray(rows) && rows.length > 0) {
            return NextResponse.json({ msg: 'success', data: rows[0] }, { status: 200 });
        } else {
            return NextResponse.json({ msg: 'error', data: '文章不存在' }, { status: 200 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}