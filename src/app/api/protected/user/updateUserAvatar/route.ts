import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        const { username } = decode;
        const connection = await pool.getConnection();
        const data = await req.json();
        const sql = `UPDATE users SET profile = ? WHERE username = ?`;
        const values = [data.avatarUrl, username];
        const [ rows ] = await connection.execute(sql, values);
        return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}