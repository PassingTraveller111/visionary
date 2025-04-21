import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import redis from '@/lib/redis';
import {verifyToken} from "@/utils/auth";
import {userTableType} from "@/app/api/sql/type";
import {getUserInfoKey} from "@/app/api/redisKeys";

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
        // 尝试从Redis中获取数据
        // const cachedData = await redis.get(getUserInfoKey(userId));
        // if (cachedData) return NextResponse.json({ msg: 'success', data: JSON.parse(cachedData) }, { status: 200 });
        const [ rows ] = await connection.execute(`SELECT profile, id, email, nick_name, create_time, first_name, last_name, role, username FROM users WHERE id = ?`, [ userId ]);
        if (Array.isArray(rows) && rows.length > 0) {
            // redis.set(getUserInfoKey(userId), JSON.stringify(rows[0]));
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