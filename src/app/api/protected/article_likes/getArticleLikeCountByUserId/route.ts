import {NextRequest, NextResponse} from "next/server";
import {article_likes} from "@/app/api/sql/article_likes";
import { redisInstance } from "@/app/api/redisKeys";

export type getArticleLikeCountByUserIdRequestType = {
    userId: number;
}

export type getArticleLikeCountByUserIdResponseType = {
    msg: 'success';
    data: {
        userId: number;
        like_count: number;
    };
} | {
    msg: 'error';
}

export async function POST(req: NextRequest) {
    try {
        const data: getArticleLikeCountByUserIdRequestType = await req.json();
        const {
            userId,
        } = data;
        // const cacheData = await redisInstance.getArticleLikeCountByUserId.getRedisValue({ userId });
        // if (cacheData) return NextResponse.json({ msg: 'success', data: cacheData });
        const results = await article_likes.getArticleLikeCountByUserId(userId);
        if (results) {
            const [ rows ] = results;
            if (Array.isArray(rows) && rows.length >= 1) {
                await redisInstance.getArticleLikeCountByUserId.setRedisValue({ userId }, rows[0]);
                return NextResponse.json({
                    msg: 'success',
                    data: rows[0],
                }, { status: 200 });
            } else {
                return NextResponse.json({
                    msg: 'error',
                })
            }
        }
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}