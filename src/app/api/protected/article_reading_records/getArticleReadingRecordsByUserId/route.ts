import {NextRequest, NextResponse} from "next/server";
import {article_reading_records} from "@/app/api/sql/article_reading_records";
import {article_reading_recordsTableType} from "@/app/api/sql/type";
import {articleTableType} from "@/app/api/sql/type";

export type getArticleReadingRecordsByUserIdRequestType = {
    userId: number;
    pageNum: number;
    pageSize: number;
}

export type getArticleReadingRecordsByUserIdResponseType = {
    msg: 'success';
    data: (article_reading_recordsTableType & Pick<articleTableType, 'title' | 'summary' | 'author_nickname'>)[]
} | {
    msg: 'error';
}

export async function POST(req: NextRequest) {
    try {
        const data: getArticleReadingRecordsByUserIdRequestType = await req.json();
        const {
            userId,
            pageNum,
            pageSize,
        } = data;
        const results = await article_reading_records.getArticleReadingRecordsByUserId(userId, pageNum, pageSize);
        if (results) {
            const [ rows ] = results;
            return NextResponse.json({
                msg: 'success',
                data: rows,
            }, { status: 200 });
        }
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}