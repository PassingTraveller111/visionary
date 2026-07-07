import { NextRequest, NextResponse } from "next/server";
import {article} from "@/app/api/sql/article";

export type getArticleCountByUserIdRequest = {
    userId: number;
}

export type getArticleCountByUserIdResponse = {
    msg: 'success';
    data: {
        articleCounts: number;
    };
} | {
    msg: 'error';
}

export async function POST(req: NextRequest) {
    try {
        const data: getArticleCountByUserIdRequest = await req.json();
        const result = await article.getArticleCountByUserId(data.userId);
        if(result) {
            const [ [ { articleCounts } ] ] = result;
            return NextResponse.json({ msg: 'success', data: { articleCounts } },{ status: 200 });
        }
        return NextResponse.json({ msg: 'error' }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 400 });
    }
}
