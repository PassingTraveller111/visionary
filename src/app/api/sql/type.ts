

export type email_verificationTableType = {
    email: string,
    verificationCode: string,
    id: string,
    create_at: string,
    expired_at: string,
}


export type chatContentType = {
    content: string, // 发送的内容
    sendTime: string, // 发送的时间
    role: 'user' | 'assistant', // 发送的角色
}[] | null;

export type assistant_chat_recordTableType = {
    chat_id: number, // 主键，该聊天的id
    chat_content: chatContentType, // 聊天记录
    draft_id: number, // 草稿id
}