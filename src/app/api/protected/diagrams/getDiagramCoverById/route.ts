import {NextRequest, NextResponse} from "next/server";
import {diagram} from "@/app/api/sql/diagram";

export type getDiagramCoverByIdReqType = {
    id: number;
}

export type getDiagramCoverByIdResType = {
    msg: 'success' | 'error';
    data: {
        id: number;
        title: string;
        cover: string;
        author_id: number;
    };
}


export async function POST(req: NextRequest) {
    try {
        const data: getDiagramCoverByIdReqType = await req.json();
        const { id } = data;
        const result = await diagram.getDiagramCoverById(id);
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