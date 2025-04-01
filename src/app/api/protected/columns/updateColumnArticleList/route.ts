import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {Key} from "react";


export type updateColumnArticleListReqType = {
    column_id: number;
    article_ids: Key[]
}

export type updateColumnArticleListResType = {
    msg: 'success' | 'error',
}

export async function POST(req: NextRequest){
    const connection = await pool.getConnection();
    try {
        const { column_id, article_ids }: updateColumnArticleListReqType = await req.json();
        // 开始事务
        await connection.beginTransaction();

        // 删除原有关联
        const deleteQuery = 'DELETE FROM article_columns WHERE column_id = ?';
        await connection.execute(deleteQuery, [column_id]);

        // 插入新的关联
        if (article_ids.length > 0) {
            const values = article_ids.map(articleId => [articleId, column_id]);
            const insertQuery = 'INSERT INTO article_columns (article_id, column_id) VALUES ?';
            await connection.query(insertQuery, [values]);
        }

        // 提交事务
        await connection.commit();
        return NextResponse.json({ msg: 'success' }, { status: 200 });
    } catch (error) {
        // 回滚事务
        await connection.rollback();
        return NextResponse.json({ msg: 'error', data: error }, { status: 500 });

    } finally {
        // 释放连接
        connection.release();
    }
}