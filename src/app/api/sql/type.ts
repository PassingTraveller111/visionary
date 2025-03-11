
export enum TableNames {
    users = 'users', // 用户表
    articles = 'articles', // 文章表
    article_likes = 'article_likes', // 文章点赞记录表
    assistant_chat_record = 'assistant_chat_record', // 助手聊天记录表
    drafts = 'drafts', // 草稿表
    email_verification = 'email_verification', // 邮箱验证表
    quotes = 'quotes', // 格言表
    reviews = 'reviews', // 审核稿表
    article_reading_records = 'article_reading_records', // 浏览记录
    article_collections = 'article_collections', // 收藏表
}

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
}[];

export type assistant_chat_recordTableType = {
    chat_id: number, // 主键，该聊天的id
    chat_content: chatContentType, // 聊天记录
    draft_id: number, // 草稿id
}

export type quotesTableType = {
    id: number;
    quote_text: string;
    created_time: string;
}

export type article_reading_recordsTableType = {
    record_id: number,
    article_id: number,
    user_id: number,
    read_time: string, // 阅读时间
}

// 收藏表
export type article_collectionsTableType = {
    id: number,
    user_id: number, // 收藏的用户id
    article_id: number, // 收藏的文章id
    collect_time: string, // 收藏的时间
}