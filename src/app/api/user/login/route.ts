import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import { createToken } from "@/utils/auth";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();
        const connection = await pool.getConnection();
        const [ rows ] = await connection.execute(`SELECT * FROM users WHERE username = '${username}'`);
        const res = rows as {
            username: string;
            password: string;
        }[];
        connection.release();
        if (res.length > 0
            && res[0]?.username === username
            && res[0]?.password === password
        ) {
            const token = createToken(username);
            const response = NextResponse.json({ status: 200, msg: 'success'}, { status: 200});
            response.cookies.set('token', token, {
                expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 60),
                httpOnly: true,
                path: '/',
            })
            return response;
        } else {
            return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}