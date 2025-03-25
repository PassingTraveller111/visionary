import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";
import {draftTableType} from "@/app/api/sql/type";

export type getDraftListRequestType = {
    authorId: number;
}
export type getDraftListResponseType = {
    msg: 'success' | 'error';
    data: itemType[];
}
export type itemType = Pick<draftTableType, 'id' | 'title' | 'review_id'>;

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        const { userId } = decode;
        const data: getDraftListRequestType = await req.json();
        const isOwn = userId === data.authorId;
        // 非本人无访问权限
        if (!isOwn) return NextResponse.json({ msg: 'error', data: '无访问权限' }, { status: 200 });
        // 只有仅草稿的草稿才能展示在草稿箱
        const sql = `SELECT id, title, review_id 
                     FROM drafts 
                     WHERE author_id = ? AND status = 'onlyDraft'
                     ORDER BY id DESC`;
        const values = [data.authorId];
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