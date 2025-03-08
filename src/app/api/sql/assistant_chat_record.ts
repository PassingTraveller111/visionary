import {query} from "@/app/api/utils";
import {chatContentType} from "@/app/api/sql/type";


const insertChatRecord = async (draft_id: number, chat_content: chatContentType) => {
    return (await query(`INSERT INTO assistant_chat_record SET draft_id = ?, chat_content = ?`, [draft_id, chat_content])) as [ { insertId: number } ] | null;
}

const getChatRecordByDraftId = async (draft_id: number) => {
    return (await query(`SELECT * FROM assistant_chat_record WHERE draft_id = ?`, [draft_id]));
}

export const assistant_chat_record = {
    insertChatRecord,
    getChatRecordByDraftId,
}