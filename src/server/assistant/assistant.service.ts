import {openai} from "@/lib/assistant";
import {assistant_chat_record} from "@/server/sql/assistant_chat_record";
import type {AssistantChatRecord, ChatContent} from "@/shared/api/assistant";

export const insertChatRecord = async (draftId: number): Promise<AssistantChatRecord | null> => {
    const initChatContent: ChatContent = [{
        role: 'assistant',
        content: '你好，我是创作助手',
        sendTime: new Date().toString(),
    }];

    const result = await assistant_chat_record.insertChatRecord(draftId, initChatContent);
    if (!result) return null;

    const [ { insertId } ] = result;
    return { chat_id: insertId, draft_id: draftId, chat_content: initChatContent };
}

export const getChatRecordByDraftId = async (draftId: number): Promise<AssistantChatRecord | null> => {
    const result = await assistant_chat_record.getChatRecordByDraftId(draftId);
    if (!result) return null;

    const [ rows ] = result;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] as AssistantChatRecord : null;
}

export const sendMessage = async (chatId: number, messages: ChatContent): Promise<ChatContent | null> => {
    const completion = await openai.chat.completions.create({
        messages,
        model: "deepseek-chat",
    });
    const assistantMessages: ChatContent = completion.choices.map((choice) => ({
        role: 'assistant',
        content: choice.message.content ?? '',
        sendTime: new Date().toString(),
    }));

    const result = await assistant_chat_record.getChatRecordByChatId(chatId);
    if (!result) return null;

    const [ rows ] = result;
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const history = rows[0] as AssistantChatRecord;
    await assistant_chat_record.updateChatRecord(chatId, [
        ...history.chat_content,
        ...messages,
        ...assistantMessages,
    ]);
    return assistantMessages;
}
