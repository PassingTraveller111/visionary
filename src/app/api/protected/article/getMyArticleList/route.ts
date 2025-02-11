import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";


export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        const { userId } = decode;
        const connection = await pool.getConnection();
        const sql = `SELECT id, title, updated_time, views, likes FROM articles WHERE author_id = ? ORDER BY updated_time DESC`;
        const [ rows ] = await connection.execute(sql, [ userId ]);
        return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}