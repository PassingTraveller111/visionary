import {NextRequest, NextResponse} from "next/server";
import {assistant_chat_record} from "@/app/api/sql/assistant_chat_record";
import {assistant_chat_recordTableType} from "@/app/api/sql/type";


export type getChatRecordRequestType = {
    draft_id: number, // 草稿id
}

export type getChatRecordResponseType = {
    msg: 'success',
    data: assistant_chat_recordTableType,
} | {
    msg: 'error',
}

export async function POST(req: NextRequest) {
    const data: getChatRecordRequestType = await req.json();
    const result = await assistant_chat_record.getChatRecordByDraftId(data.draft_id);
    if(result){
        const [ rows ] = result;
        if(Array.isArray(rows) && rows.length > 0){
            return NextResponse.json({ msg: 'success', data: rows[0] }, { status: 200 });
        }
    }
    return NextResponse.json({ msg: 'error' }, { status: 400 });
}