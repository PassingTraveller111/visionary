import {NextRequest, NextResponse} from "next/server";
import {getProfile} from "@/app/api/services/user";

export type { getProfileRequestType, getProfileResponseType } from "@/app/api/services/user";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();
        const data = await getProfile(userId);
        if (data) return NextResponse.json({ msg: 'success', data }, { status: 200 });
        return NextResponse.json({ msg: 'error' }, { status: 401 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    }
}
