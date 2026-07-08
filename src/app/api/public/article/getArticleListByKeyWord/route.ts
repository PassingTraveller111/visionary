import {NextRequest, NextResponse} from "next/server";
import {getArticleListByKeyWord} from "@/app/api/services/article";

export type { getArticleListByKeyWordRequestType, getArticleListByKeyWordResponseType, ItemType } from "@/app/api/services/article";

export async function POST(req: NextRequest) {
    try {
        const { keyword, pageNum, pageSize } = await req.json();
        const data = await getArticleListByKeyWord(keyword, pageNum, pageSize);
        if (data) return NextResponse.json({ msg: 'success', data }, { status: 200 });
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    }
}
