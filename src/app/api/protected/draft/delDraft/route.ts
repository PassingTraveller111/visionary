import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import redis from "@/lib/redis";
import {getDraftKey} from "@/app/api/redisKeys";

export type delDraftRequestType = {
    id: number;
}

export type delDraftResponse = {
    msg: 'success' | 'error';
    data: string;
}

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const data: delDraftRequestType = await req.json();
        // 只能删除仅草稿的草稿
        const sql = `DELETE FROM drafts WHERE id = ? AND status = 'onlyDraft';`;
        await connection.execute(sql, [data.id]);
        await redis.del(getDraftKey(data.id))
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