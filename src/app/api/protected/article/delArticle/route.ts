import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";

export type updateDataType = {
    articleId: number;
}

export async function POST(req: NextRequest) {
    try {
        const connection = await pool.getConnection();
        const data: updateDataType = await req.json();
        const sql = `DELETE FROM articles WHERE id = ?;`;
        const values = [data.articleId];
        const [ rows ] = await connection.execute(sql, values);
        return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}