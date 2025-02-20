import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";

export async function GET(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        const { username } = decode;
        const [ rows ] = await connection.execute(`SELECT * FROM users WHERE username = '${username}'`);
        const res = rows as {
            username: string;
            password?: string;
        }[];
        connection.release();
        if (res.length > 0) {
            delete res[0].password;
            return NextResponse.json({ msg: 'success', data: res[0] }, { status: 200 });
        } else {
            return NextResponse.json({ msg: 'error' }, { status: 401 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
        if (connection) {
            connection.release()
        }
    }
}