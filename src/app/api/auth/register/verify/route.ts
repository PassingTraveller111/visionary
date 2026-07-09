import {NextRequest, NextResponse} from "next/server";
import {verifyRegisterCode} from "@/server/user/user.service";
import type {RegisterVerifyCodeRequest} from "@/shared/api/user";

export async function POST(req: NextRequest) {
    const data: RegisterVerifyCodeRequest = await req.json();
    const result = await verifyRegisterCode(data);
    const response = NextResponse.json(result, { status: result.status });
    if ('token' in result) {
        response.cookies.set('token', result.token, {
            expires: result.expires,
            httpOnly: true,
            path: '/',
        });
    }
    return response;
}
