import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";

export type editorAuthDataType = {
    articleId: number | 'new';
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        const { userId } = decode;
        const connection = await pool.getConnection();
        const data: editorAuthDataType = await req.json();
        if (data.articleId === 'new') {
            return NextResponse.json({ msg: 'success', data: { auth: true } }, { status: 200 });
        }
        const sql = `SELECT author_id From articles WHERE id = ?;`;
        const values = [data.articleId];
        const [ rows ] = await connection.execute(sql, values);
        console.log('rows', rows);
        if(Array.isArray(rows) && rows.length > 0) {
            if ((rows[0] as { author_id: number } )?.author_id === userId) {
                return NextResponse.json({ msg: 'success', data: { auth: true } }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'success', data: { auth: false } }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: 'error', data: { auth: false } }, { status: 200 });
    }
}