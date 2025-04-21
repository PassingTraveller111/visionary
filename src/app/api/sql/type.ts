
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

// 文章表
export type articleTableType = {
    id: number;
    content: string;
    title: string;
    summary: string;
    tags: string[];
    review_status: 'pending_review' | 'failed_review' | 'already_review';
    is_published: 0 | 1;
    published_time: string;
    updated_time: string;
    author_id: number;
    author_nickname: string;
    collects: number;
    draft_id?: number;
    review_id?: number;
    cover?: string;
}

// 邮箱验证码表
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

// 文章评论表
export type article_commentsTableType = {
    comment_id: number,
    article_id: number,
    user_id: number,
    comment_text: string,
    parent_comment_id: number,
    created_at: string,
    updated_at: string,
    is_deleted: 0 | 1,
}

// 文章点赞表
export type articleLikesTableType = {
    id: number;
    user_id: number;
    article_id: number;
    like_at: string;
}

// 草稿表
export type draftTableType = {
    id: number;
    content: string;
    title: string;
    summary: string;
    tags: string[];
    status: 'onlyDraft' | 'hasArticle';
    author_id: number;
    author_nickname: string;
    article_id?: number;
    review_id?: number;
    cover?: string;
    update_time?: string;
    create_time?: string;
}

// 审核表
export type reviewTableType = {
    id: number;
    content: string;
    title: string;
    summary: string;
    tags: string[];
    status: reviewStatusType;
    author_id: number;
    author_nickname: string;
    article_id?: number;
    draft_id?: number;
    cover?: string;
}

export type reviewStatusType = 'reviewing' | 'review_fail' | 'review_success';

// 用户表
export type userTableType = {
    id: number,
    username: string,
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    create_time: string,
    role: 0 | 1 | 2,
    profile: string, // 头像
    nick_name: string,
}

// 专栏表
export type columnsTableType = {
    column_id: number,
    column_name: string,
    cover_image?: string,
    author_id: number,
    description: string,
    created_at: string,
}

// 文章专栏关联表
export type article_columnsTableType = {
    id: number,
    column_id: number,
    article_id: number,
}


// 图表表
export type diagramTableType = {
    id: number,
    title: string,
    data: string,
    intro: string,
    tags: string[],
    author_id: number,
    cover?: string,
    type: 'flow' | 'mindMap',
    update_time: string,
    create_time: string,
}