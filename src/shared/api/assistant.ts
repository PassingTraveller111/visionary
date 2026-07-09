export type ChatContentItem = {
    content: string;
    sendTime: string;
    role: 'user' | 'assistant';
};

export type ChatContent = ChatContentItem[];

export type AssistantChatRecord = {
    chat_id: number;
    chat_content: ChatContent;
    draft_id: number;
};

export type insertChatRecordRequestType = {
    draft_id: number;
};

export type insertChatRecordResponseType = {
    msg: 'success';
    data: AssistantChatRecord;
} | {
    msg: 'error';
};

export type getChatRecordRequestType = {
    draft_id: number;
};

export type getChatRecordResponseType = {
    msg: 'success';
    data: AssistantChatRecord;
} | {
    msg: 'error';
};

export type sendMessageRequestType = {
    chat_id: number;
    messages: ChatContent;
};

export type sendMessageResponse = {
    msg: 'success';
    data: ChatContent;
} | {
    msg: 'error';
};
