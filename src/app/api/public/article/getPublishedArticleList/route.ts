import {NextRequest, NextResponse} from "next/server";
import {getPublishedArticleList} from "@/app/api/services/article";

export type { getPublishedArticleListRequestType, getPublishedArticleListResponseType, publishedItemType } from "@/app/api/services/article";

export async function POST(req: NextRequest) {
    try {
        const { pageNum, pageSize } = await req.json();
        const result = await getPublishedArticleList(pageNum, pageSize);
        if (result) return NextResponse.json({ msg: 'success', data: result.rows, total: result.total }, { status: 200 });
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    }
}
