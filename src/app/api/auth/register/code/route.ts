import {NextRequest, NextResponse} from "next/server";
import {sendRegisterCode} from "@/server/user/user.service";
import type {RegisterSendCodeRequest} from "@/shared/api/user";

export async function POST(req: NextRequest) {
    const { email }: RegisterSendCodeRequest = await req.json();
    const result = await sendRegisterCode(email);
    return NextResponse.json(result, { status: result.status });
}
