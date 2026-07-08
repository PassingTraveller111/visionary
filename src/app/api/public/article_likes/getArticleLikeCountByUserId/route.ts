import {NextRequest, NextResponse} from "next/server";
import {getArticleLikeCountByUserId} from "@/app/api/services/engagement";

export type { getArticleLikeCountByUserIdRequestType, getArticleLikeCountByUserIdResponseType } from "@/app/api/services/engagement";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();
        const data = await getArticleLikeCountByUserId(userId);
        if (data) return NextResponse.json({ msg: 'success', data }, { status: 200 });
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    }
}
