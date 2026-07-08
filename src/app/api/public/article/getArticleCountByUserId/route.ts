import {NextRequest, NextResponse} from "next/server";
import {getArticleCountByUserId} from "@/app/api/services/article";
import {getOptionalUserId} from "@/app/api/services/auth";

export type { getArticleCountByUserIdRequest, getArticleCountByUserIdResponse } from "@/app/api/services/article";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();
        const articleCounts = await getArticleCountByUserId(userId, getOptionalUserId(req));
        if (articleCounts !== null) return NextResponse.json({ msg: 'success', data: { articleCounts } }, { status: 200 });
        return NextResponse.json({ msg: 'error' }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: 'error' }, { status: 400 });
    }
}
