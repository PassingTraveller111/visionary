import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";
import redis from "@/lib/redis";
import {getUserInfoKey} from "@/app/api/redisKeys";

type valuesType = {
    avatarUrl: string,
}

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        const { userId } = decode;
        const data: valuesType = await req.json();
        const sql = `UPDATE users SET profile = ? WHERE id = ?`;
        const values = [data.avatarUrl, userId];
        const [ rows ] = await connection.execute(sql, values);
        await redis.del(getUserInfoKey(userId));
        return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}