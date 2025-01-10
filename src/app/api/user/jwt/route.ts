import {NextRequest, NextResponse} from "next/server";
import { verifyToken } from "@/utils/auth";

export async function POST(req: NextRequest) {
    const { token } = await req.json();
    const decoded = verifyToken(token);
    return NextResponse.json({decoded}, { status: 200 });
}