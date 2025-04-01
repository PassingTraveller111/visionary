import {NextRequest, NextResponse} from "next/server";
import {article} from "@/app/api/sql/article";

export type getArticleListByColumnIdReqType = {
    column_id: number;
}

export type getArticleListByColumnIdResType = {
    msg: 'success' | 'error';
    data: {
        id: number;
        title: string;
        summary: string;
        tags: string[];
        cover: string;
        updated_time: string;
    }[]
}

export async function POST(req: NextRequest){
    try {
        const data: getArticleListByColumnIdReqType = await req.json();
        const result = await article.getArticleListByColumnId(data.column_id);
        if(result){
            const [ rows ] = result;
            if(Array.isArray(rows)){
                return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'error', data: result }, { status: 200 });
    }catch (error) {
        return NextResponse.json({ msg: 'error', data: error }, { status: 200 });
    }
}