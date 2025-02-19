import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";

export type updateDraftDataType = {
    draftId: number | 'new';
    content: string;
    title: string;
    summary: string;
    tags: string[];
    author_id: number;
    author_nickname: string;
};


export async function POST(req: NextRequest) {
    try {
        const connection = await pool.getConnection();
        const data: updateDraftDataType = await req.json();
        const { title, content, summary, tags, author_id, draftId, author_nickname } = data;
        let sql, values: unknown[];
        if (draftId === 'new') {
            sql = `INSERT INTO drafts (title, content, summary, tags, author_id, author_nickname) VALUES (?,?,?,?,?,?)`;
            values = [title, content, summary, tags, author_id, author_nickname];
        } else {
            sql = `UPDATE drafts SET content = ?, title = ?, summary = ?, tags = ? WHERE id = ?;`;
            values = [content, title, summary, tags, draftId];
        }
        const [ rows ] = await connection.execute(sql, values);
        return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}