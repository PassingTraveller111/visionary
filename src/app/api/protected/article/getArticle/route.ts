import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";

type dataType = {
    articleId: number;
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        // const { username } = decode;
        const connection = await pool.getConnection();
        const data: dataType = await req.json();
        const sql = `SELECT * FROM articles WHERE id = ?`;
        const values = [data.articleId];
        const [ rows ] = await connection.execute(sql, values);
        if(Array.isArray(rows) && rows.length > 0) {
            return NextResponse.json({ msg: 'success', data: rows[0] }, { status: 200 });
        } else {
            return NextResponse.json({ msg: 'error', data: '文章不存在' }, { status: 200 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}