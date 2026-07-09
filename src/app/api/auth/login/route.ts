import {NextRequest, NextResponse} from "next/server";
import {login} from "@/server/user/user.service";
import type {LoginRequest} from "@/shared/api/user";

export async function POST(req: NextRequest) {
    const data: LoginRequest = await req.json();
    const result = await login(data);
    if (!result) return NextResponse.json({ status: 401, message: '用户名或密码错误' }, { status: 401 });

    const response = NextResponse.json({ status: 200, msg: 'success', data: result.userInfo}, { status: 200});
    response.cookies.set('token', result.token, {
        expires: result.expires,
        httpOnly: true,
        path: '/',
    });
    return response;
}
