import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = NextResponse.json({ status: 200, msg: 'success', }, { status: 200});
        response.cookies.set('token', '', {
            expires: 0,
            httpOnly: true,
            path: '/',
        })
        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}