import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {verifyToken} from "@/utils/auth";

export type updateDataType = {
    articleId: number | 'new';
    content: string;
    title: string;
    authorId: number;
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const decode = verifyToken(token);
        // const { username } = decode;
        const connection = await pool.getConnection();
        const data: updateDataType = await req.json();
        let sql, values: unknown[];
        if (data.articleId === 'new') {
            sql = `INSERT INTO articles (title, content, author_id, published_time, updated_time) VALUES (?,?,?,?,?)`;
            values = [data.title, data.content, data.authorId, new Date(), new Date()];
        } else {
            sql = `UPDATE articles SET content = ?, title = ? WHERE id = ?;`;
            values = [data.content, data.title, data.articleId]
        }
        const [ rows ] = await connection.execute(sql, values);
        return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}