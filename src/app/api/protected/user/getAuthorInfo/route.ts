import {NextRequest, NextResponse} from "next/server";
import {getAuthorInfo} from "@/app/api/services/user";

export type { AuthorInfoType, getAuthorInfoRequestType, getAuthorInfoResponseType } from "@/app/api/services/user";

export async function POST(req: NextRequest) {
    try {
        const { authorId } = await req.json();
        const data = await getAuthorInfo(authorId);
        if (data) return NextResponse.json({ msg: 'success', data }, { status: 200 });
        return NextResponse.json({ msg: 'error', data }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}
