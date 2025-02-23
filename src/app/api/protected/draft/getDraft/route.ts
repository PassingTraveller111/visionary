import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {draftTableType} from "@/app/api/protected/draft/type";
import redis from "@/lib/redis";
import {getDraftKey} from "@/app/api/redisKeys";

export type getDraftDataType = {
    draftId: number;
}

export type getDraftResponseType = {
    data: draftTableType,
    msg: 'success' | 'error',
}

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const data: getDraftDataType = await req.json();

        const cacheData = await redis.get(getDraftKey(data.draftId));
        if (cacheData) return NextResponse.json({ msg: 'success', data: JSON.parse(cacheData) }, { status: 200 });

        const sql = `SELECT * FROM drafts WHERE id = ?`;
        const values = [data.draftId];
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