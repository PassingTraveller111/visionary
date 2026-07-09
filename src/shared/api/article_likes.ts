export type ArticleLikeState = {
    isLike: boolean;
    like_at?: string;
};

export type SetArticleLikeRequest = {
    isLike: boolean;
};

export type ArticleLikeCount = {
    userId: number;
    like_count: number;
};

export type getArticleIsLikeRequestType = {
    userId: number;
    articleId: number;
};

export type getArticleIsLikeResponseType = {
    msg: 'success';
    data: ArticleLikeState;
} | {
    msg: 'error';
};

export type setArticleIsLikeRequestType = {
    userId: number;
    articleId: number;
    isLike: boolean;
};

export type setArticleIsLikeResponseType = {
    msg: 'success';
    data: ArticleLikeState;
} | {
    msg: 'error';
};

export type getArticleLikeCountByUserIdRequestType = {
    userId: number;
};

export type getArticleLikeCountByUserIdResponseType = {
    msg: 'success';
    data: ArticleLikeCount;
} | {
    msg: 'error';
};
