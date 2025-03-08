import {NextRequest, NextResponse} from "next/server";
import {openai} from "@/lib/assistant";
import {assistant_chat_recordTableType, chatContentType} from "@/app/api/sql/type";
import {assistant_chat_record} from "@/app/api/sql/assistant_chat_record";

export type sendMessageRequestType = {
    chat_id: number;
    messages: chatContentType;
}

export type sendMessageResponse = {
    msg: 'success',
    data: chatContentType,
} | {
    msg: 'error';
}

export async function POST(req: NextRequest) {
    const data: sendMessageRequestType = await req.json();
    // 向ai发起对话
    const completion = await openai.chat.completions.create({
        messages: data.messages,
        model: "deepseek-chat",
    });
    const res = completion.choices.map((choice) => {
        return {
            role: choice.message.role,
            content: choice.message.content ?? '',
            sendTime: new Date().toString(),
        }
    });
    // 插入用户的问题和ai的回答
    const insertChatRecord = [
        ...data.messages,
        ...res,
    ];
    const result = await assistant_chat_record.getChatRecordByChatId(data.chat_id);
    if(result){
        const [ rows ] = result;
        if(Array.isArray(rows) && rows.length > 0){
            const history = rows[0] as assistant_chat_recordTableType;
            const newChantContent = [
                ...history.chat_content,
                ...insertChatRecord,
            ]
            await assistant_chat_record.updateChatRecord(data.chat_id, newChantContent);
            return NextResponse.json({ msg: 'success', data: res }, { status: 200 });
        }
    }
    return NextResponse.json({ msg: 'error', data: res }, { status: 400 });
}