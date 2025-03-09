import { NextRequest, NextResponse } from "next/server";
import { getArticleCountByUserId } from "@/app/api/redisKeys";
import redis from "@/lib/redis";
import {article} from "@/app/api/sql/article";

export type getArticleCountByUserIdRequest = {
    userId: number;
}

export type getArticleCountByUserIdResponse = {
    msg: 'success' | 'error';
    data: {
        articleCounts: number;
    };
}

export async function POST(req: NextRequest) {
    try {
        const data: getArticleCountByUserIdRequest = await req.json();
        const CacheData = await redis.get(getArticleCountByUserId(data.userId));
        if (CacheData) {
            return NextResponse.json({ msg: 'success', data: { articleCounts: CacheData } },{ status: 200 });
        }
        const result = await article.getArticleCountByUserId(data.userId);
        if(result) {
            const [ [ { articleCounts } ] ] = result;
            redis.set(getArticleCountByUserId(data.userId), articleCounts);
            return NextResponse.json({ msg: 'success', data: { articleCounts } },{ status: 200 });
        }
        return NextResponse.json({ msg: 'error' }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 400 });
    }
}