import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";

export type draftEditorAuthDataType = {
    draftId: number | 'new';
}

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        const { userId } = decode;
        const data: draftEditorAuthDataType = await req.json();
        if (data.draftId === 'new') {
            return NextResponse.json({ msg: 'success', data: { auth: true } }, { status: 200 });
        }
        const sql = `SELECT author_id From drafts WHERE id = ?;`;
        const values = [data.draftId];
        const [ rows ] = await connection.execute(sql, values);
        if(Array.isArray(rows) && rows.length > 0) {
            if ((rows[0] as { author_id: number } )?.author_id === userId) {
                return NextResponse.json({ msg: 'success', data: { auth: true } }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'success', data: { auth: false } }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: 'error', data: { auth: false } }, { status: 200 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}