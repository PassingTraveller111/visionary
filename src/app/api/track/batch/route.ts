import { NextResponse } from "next/server";

export async function POST() {
    try {
        if (Math.random() < 0.1) {
            return NextResponse.json({ msg: '批量上报失败', code: 500 }, { status: 500 });
        }else{
            return NextResponse.json({ msg: '批量上报成功', code: 200 }, { status: 200 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {

    }
}
