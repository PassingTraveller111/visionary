import {NextRequest, NextResponse} from "next/server";
import {diagram} from "@/app/api/sql/diagram";
import {verifyToken} from "@/utils/auth";

export type renameDiagramReqType = {
    id: number;
    title: string;
}


export async function POST(req: NextRequest) {
    try {
        const data: renameDiagramReqType = await req.json();
        const token = req.cookies.get('token')?.value ?? '';
        const { userId } = verifyToken(token);
        const result = await diagram.renameDiagram(
            data.title,
            data.id,
            userId,
        );
        if (result) {
            const [ rows] = result;
            return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
        }
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}