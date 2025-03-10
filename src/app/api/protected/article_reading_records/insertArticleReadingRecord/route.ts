import {NextRequest, NextResponse} from "next/server";
import {article_reading_records} from "@/app/api/sql/article_reading_records";

export type insertArticleReadingRecordRequestType = {
    userId: number;
    articleId: number;
}

export type insertArticleReadingRecordResponseType = {
    msg: 'success';
    data: {
        insertId: number,
    };
} | {
    msg: 'error';
}

export async function POST(req: NextRequest) {
    try {
        const data: insertArticleReadingRecordRequestType = await req.json();
        const {
            userId,
            articleId,
        } = data;
        const results = await article_reading_records.insertArticleReadingRecord(articleId, userId);
        if (results) {
            const [{ insertId }] = results;
            return NextResponse.json({
                msg: 'success',
                data: {
                    insertId,
                }
            }, { status: 200 });
        }
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}