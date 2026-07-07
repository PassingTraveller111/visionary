import {NextRequest, NextResponse} from "next/server";
import { verifyToken } from "@/utils/auth";

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();
        const decoded = verifyToken(token);
        return NextResponse.json({decoded}, { status: 200 });
    } catch {
        return NextResponse.json({ msg: 'invalid token' }, { status: 401 });
    }
}
