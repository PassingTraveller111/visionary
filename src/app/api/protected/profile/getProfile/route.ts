import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        const { userId } = await req.json();
        const { username } = decode;
        const connection = await pool.getConnection();
        const [ rows ] = await connection.execute(`SELECT * FROM users WHERE id = '${userId}'`);
        const res = rows as {
            nike_name: string;
            username: string;
            id: number;
            profile: string;
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