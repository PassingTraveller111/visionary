import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import redis from "@/lib/redis";
import {getDraftKey} from "@/app/api/redisKeys";

export type updateDraftDataType = {
    draftId: number | 'new';
    content: string;
    title: string;
    summary: string;
    tags: string[];
    author_id: number;
    author_nickname: string;
    cover?: string;
};


export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const data: updateDraftDataType = await req.json();
        const { title, content, summary, tags, author_id, draftId, author_nickname, cover } = data;
        let sql, values: unknown[];
        if (draftId === 'new') {
            sql = `INSERT INTO drafts (title, content, summary, tags, author_id, author_nickname, cover) VALUES (?,?,?,?,?,?,?)`;
            values = [title, content, summary, tags, author_id, author_nickname, cover];
        } else {
            sql = `UPDATE drafts SET content = ?, title = ?, summary = ?, tags = ?, cover = ?, update_time = ? WHERE id = ?;`;
            values = [content, title, summary, tags, cover, new Date(),draftId];
            await redis.del(getDraftKey(draftId));
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