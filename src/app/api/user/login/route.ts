import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {createToken} from "@/utils/auth";

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const { username, password, isRemember } = await req.json();
        const [ rows ] = await connection.execute(`SELECT * FROM users WHERE username = '${username}'`);
        const res = rows as {
            id: number;
            username: string;
            password: string;
            role: 0 | 1 | 2;
        }[];
        if (res.length > 0
            && res[0]?.username === username
            && res[0]?.password === password
        ) {
            const token = createToken(username, res[0].id, res[0].role);
            const response = NextResponse.json({ status: 200, msg: 'success', data: res[0]}, { status: 200});
            response.cookies.set('token', token, {
                expires: isRemember ? new Date(new Date().getTime() + 1000 * 60 * 60 * 60) : undefined,
                httpOnly: true,
                path: '/',
            })
            return response;
        } else {
            return NextResponse.json({ status: 401, message: '用户名或密码错误' }, { status: 401 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}