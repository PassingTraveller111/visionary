import {NextRequest, NextResponse} from "next/server";
import {assistant_chat_record} from "@/app/api/sql/assistant_chat_record";
import {assistant_chat_recordTableType, chatContentType} from "@/app/api/sql/type";


export type insertChatRecordRequestType = {
    draft_id: number, // 草稿id
}

export type insertChatRecordResponseType = {
    msg: 'success',
    data: assistant_chat_recordTableType,
} | {
    msg: 'error',
}

export async function POST(req: NextRequest) {
    const data: insertChatRecordRequestType = await req.json();
    const initChatContent: chatContentType = [{
        role: 'assistant',
        content: '你好，我是创作助手',
        sendTime: new Date().toString(),
    }];
    const result = await assistant_chat_record.insertChatRecord(data.draft_id, initChatContent);
    if(result){
        const [ { insertId } ] = result;
        return NextResponse.json({ msg: 'success', data: { chat_id: insertId, draft_id: data.draft_id, chat_content: initChatContent } }, { status: 200 });
    }
    return NextResponse.json({ msg: 'error' }, { status: 400 });
}