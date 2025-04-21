


import {NextRequest, NextResponse} from "next/server";
import {diagramTableType} from "@/app/api/sql/type";
import {diagram} from "@/app/api/sql/diagram";
import {verifyToken} from "@/utils/auth";

export type getDiagramReqType = {
    id: number;
}

export type getDiagramResType = {
    msg: 'success' | 'error';
    data: diagramTableType;
}


export async function POST(req: NextRequest) {
    try {
        const data: getDiagramReqType = await req.json();
        const { id } = data;
        const token = req.cookies.get('token')?.value ?? '';
        const { userId } = verifyToken(token);
        const result = await diagram.getDiagram(id, userId);
        if (result) {
            const [ rows ] = result;
            if(rows.length > 0) {
                return NextResponse.json({ msg: 'success', data: rows[0] }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'error' }, { status: 500 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}