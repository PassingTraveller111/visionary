import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {userTableType} from "@/app/api/protected/user/type";
import {getUserInfoKey} from "@/app/api/redisKeys";
import redis from "@/lib/redis";

export type getAuthorInfoRequestType = {
    authorId: number;
}

export type getAuthorInfoResponseType = {
    msg: 'success' | 'error';
    data: AuthorInfoType;
}

export type AuthorInfoType = Pick<userTableType, 'id' | 'email' | 'profile' | 'nick_name'>;

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const data: getAuthorInfoRequestType = await req.json();
        const cacheData = await redis.get(getUserInfoKey(data.authorId));
        if (cacheData) return NextResponse.json({msg: 'success', data: JSON.parse(cacheData)}, {status: 200});

        const [ rows ] = await connection.execute(`SELECT * FROM users WHERE id = ?`, [data.authorId]);
        if (Array.isArray(rows) && rows.length > 0) {
            const res: getAuthorInfoResponseType = {
                msg: 'success',
                data: rows[0] as AuthorInfoType,
            }
            return NextResponse.json(res, { status: 200 });
        }
        return NextResponse.json({ msg: 'error', data: rows }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
        if (connection) {
            connection.release()
        }
    }
}