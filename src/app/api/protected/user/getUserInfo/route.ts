import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";
import {userTableType} from "@/app/api/sql/type";

export type getUserInfoResponseType = {
    msg: 'success' | 'error';
    data: Pick<userTableType, 'profile' | 'id' | 'email' | 'nick_name' | 'create_time' | 'first_name' | 'last_name' | 'role' | 'username'>,
}

export async function GET(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        const { userId } = decode;
        const [ rows ] = await connection.execute(`SELECT profile, id, email, nick_name, create_time, first_name, last_name, role, username FROM users WHERE id = ?`, [ userId ]);
        if (Array.isArray(rows) && rows.length > 0) {
            return NextResponse.json({ msg: 'success', data: rows[0] }, { status: 200 });
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
