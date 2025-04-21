import {NextRequest, NextResponse} from "next/server";
import {diagramTableType} from "@/app/api/sql/type";
import {diagram} from "@/app/api/sql/diagram";
import {verifyToken} from "@/utils/auth";

export type delDiagramReqType = {
    id: number;
}

export type getDiagramResType = {
    msg: 'success' | 'error';
    data: diagramTableType;
}


export async function POST(req: NextRequest) {
    try {
        const data: delDiagramReqType = await req.json();
        const { id } = data;
        const token = req.cookies.get('token')?.value ?? '';
        const { userId } = verifyToken(token);
        const result = await diagram.deleteDiagram(id, userId);
        if (result) {
           return NextResponse.json({ msg: 'success', data: result }, { status: 200 });
        }
        return NextResponse.json({ msg: 'error' }, { status: 500 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}