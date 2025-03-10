import {NextRequest, NextResponse} from "next/server";
import {article_reading_records} from "@/app/api/sql/article_reading_records";

export type getLookCountsByUserIdRequestType = {
    userId: number;
}

export type getLookCountsByUserIdResponseType = {
    msg: 'success';
    data: {
        user_id: number;
        look_count: number;
    }
} | {
    msg: 'error';
}

export async function POST(req: NextRequest) {
    try {
        const data: getLookCountsByUserIdRequestType = await req.json();
        const {
            userId,
        } = data;
        const results = await article_reading_records.getArticleReadingRecordsCountByUserId(userId);
        if (results) {
            const [ rows ] = results;
            return NextResponse.json({
                msg: 'success',
                data: rows[0],
            }, { status: 200 });
        }
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}