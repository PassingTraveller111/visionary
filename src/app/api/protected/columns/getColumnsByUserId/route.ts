import {NextRequest, NextResponse} from "next/server";
import {getColumnsByUserId} from "@/app/api/services/columns";

export type { getColumnsByUserIdReqType, getColumnsByUserIdResType } from "@/app/api/services/columns";

export async function POST(req: NextRequest){
    try {
        const { userId } = await req.json();
        const data = await getColumnsByUserId(userId);
        if (data) return NextResponse.json({ msg: 'success', data }, { status: 200 });
        return NextResponse.json({ msg: 'error', data }, { status: 500 });
    } catch (error) {
        return NextResponse.json({ msg: 'error', data: error }, { status: 500 });
    }
}
