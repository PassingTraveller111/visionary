import {NextRequest, NextResponse} from "next/server";
import {getArticle} from "@/app/api/services/article";
import {getOptionalUserId} from "@/app/api/services/auth";

export type { getArticleRequestType, getArticleResponseType } from "@/app/api/services/article";

export async function POST(req: NextRequest) {
    try {
        const { articleId } = await req.json();
        const data = await getArticle(articleId, getOptionalUserId(req));
        if (data) return NextResponse.json({ msg: 'success', data }, { status: 200 });
        return NextResponse.json({ msg: 'error', data: '文章不存在' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    }
}
