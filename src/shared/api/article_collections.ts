export type ArticleCollectionState = {
    isCollected: 0 | 1;
};

export type SetArticleCollectionRequest = {
    isCollected: boolean;
};

export type ArticleCollectionItem = {
    article_id: number;
    collect_time: string;
    title: string;
    tags: string[];
    summary: string;
    cover?: string;
    author_name: string;
    like_count: number;
    look_count: number;
};

export type setArticleIsCollectedRequestType = {
    userId: number;
    articleId: number;
    isCollected: boolean;
};

export type setArticleIsCollectedResponseType = {
    msg: 'success';
    data: ArticleCollectionState;
} | {
    msg: 'error';
};

export type getArticleIsCollectedRequestType = {
    userId: number;
    articleId: number;
};

export type getArticleIsCollectedResponseType = {
    msg: 'success';
    data: ArticleCollectionState;
} | {
    msg: 'error';
};

export type getArticleCollectionsByUserIdRequestType = {
    userId: number;
};

export type getArticleCollectionsByUserIdResponseType = {
    msg: 'success' | 'error';
    data: ArticleCollectionItem[];
};
