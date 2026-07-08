import {NextRequest, NextResponse} from "next/server";
import {getDiagramCoverById} from "@/app/api/services/diagram";

export type { getDiagramCoverByIdReqType, getDiagramCoverByIdResType } from "@/app/api/services/diagram";

export async function POST(req: NextRequest) {
    try {
        const { id } = await req.json();
        const data = await getDiagramCoverById(id);
        if (data) return NextResponse.json({ msg: 'success', data }, { status: 200 });
        return NextResponse.json({ msg: 'error' }, { status: 500 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}
