import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        const { username } = decode;
        const connection = await pool.getConnection();
        const [ rows ] = await connection.execute(`SELECT * FROM users WHERE username = '${username}'`);
        const res = rows as {
            username: string;
            password: string;
        }[];
        connection.release();
        if (res.length > 0) {
            return NextResponse.json({ msg: 'success', data: res[0] }, { status: 200 });
        } else {
            return NextResponse.json({ msg: 'error' }, { status: 401 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}