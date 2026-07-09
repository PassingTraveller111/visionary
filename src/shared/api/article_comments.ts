export type CommentUserInfo = {
    id: number;
    nickname: string;
    avatar: string;
};

export type CommentItem = {
    comment_id: number;
    article_id: number;
    user_id: number;
    comment_text: string;
    parent_comment_id: number | null;
    created_at: string;
    updated_at: string;
    is_deleted: 0 | 1;
    children: CommentItem[];
    userInfo: CommentUserInfo;
    replyComment?: {
        id: number;
        userInfo: CommentUserInfo;
    };
};

export type SendCommentRequest = {
    commentText: string;
    parentCommentId?: number;
};

export type getCommentListByArticleIdReqType = {
    article_id: number;
};

export type getCommentListByArticleIdResType = {
    data: CommentItem[];
    msg: 'success' | 'error';
};

export type sendCommentReqType = {
    userId: number;
    articleId: number;
    commentText: string;
    parentCommentId?: number;
};

export type delCommentReqType = {
    comment_id: number;
};

export type delCommentResType = {
    msg: 'success' | 'error';
};

export type commentItem = CommentItem;
export type userInfoType = CommentUserInfo;
