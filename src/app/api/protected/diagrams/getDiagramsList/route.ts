import {NextRequest, NextResponse} from "next/server";
import {diagramTableType} from "@/app/api/sql/type";
import {diagram} from "@/app/api/sql/diagram";
import {verifyToken} from "@/utils/auth";


export type getDiagramsListResType = {
    msg: 'success' | 'error';
    data: diagramTableType[];
}


export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value ?? '';
        const { userId } = verifyToken(token);
        const result = await diagram.getDiagramsList(userId);
        if (result) {
            const [ rows ] = result;
            return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
        }
        return NextResponse.json({ msg: 'error' }, { status: 500 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}