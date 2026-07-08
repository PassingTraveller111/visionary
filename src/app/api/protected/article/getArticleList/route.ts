import {NextRequest, NextResponse} from "next/server";
import {getArticleList} from "@/app/api/services/article";
import {getOptionalUserId} from "@/app/api/services/auth";

export type { getArticleListRequestType, getArticleListResponseType, itemType } from "@/app/api/services/article";

export async function POST(req: NextRequest) {
    try {
        const { authorId } = await req.json();
        const data = await getArticleList(authorId, getOptionalUserId(req));
        return NextResponse.json({ msg: 'success', data }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}
