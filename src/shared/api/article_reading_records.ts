export type ArticleReadingRecordItem = {
    record_id: number;
    article_id: number;
    user_id: number;
    read_time: string;
    title: string;
    summary: string;
    author_nickname: string;
};

export type LookCount = {
    user_id: number;
    look_count: number;
};

export type insertArticleReadingRecordRequestType = {
    userId: number;
    articleId: number;
};

export type insertArticleReadingRecordResponseType = {
    msg: 'success';
    data: {
        insertId: number;
    };
} | {
    msg: 'error';
};

export type getArticleReadingRecordsByUserIdRequestType = {
    userId: number;
    pageNum: number;
    pageSize: number;
};

export type getArticleReadingRecordsByUserIdResponseType = {
    msg: 'success';
    data: ArticleReadingRecordItem[];
} | {
    msg: 'error';
};

export type getLookCountsByUserIdRequestType = {
    userId: number;
};

export type getLookCountsByUserIdResponseType = {
    msg: 'success';
    data: LookCount;
} | {
    msg: 'error';
};
