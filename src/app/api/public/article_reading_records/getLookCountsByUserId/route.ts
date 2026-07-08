import {NextRequest, NextResponse} from "next/server";
import {getLookCountsByUserId} from "@/app/api/services/engagement";

export type { getLookCountsByUserIdRequestType, getLookCountsByUserIdResponseType } from "@/app/api/services/engagement";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();
        const data = await getLookCountsByUserId(userId);
        if (data) return NextResponse.json({ msg: 'success', data }, { status: 200 });
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    }
}
