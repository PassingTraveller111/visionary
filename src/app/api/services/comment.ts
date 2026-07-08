import {article_comments, commentItem} from "@/app/api/sql/article_comments";

export type getCommentListByArticleIdReqType = {
    article_id: number;
}

export type getCommentListByArticleIdResType = {
    data: commentItem[];
    msg: 'success' | 'error';
}

export type {commentItem, commentUserInfoType as userInfoType} from "@/app/api/sql/article_comments";

export const getCommentListByArticleId = async (articleId: number) => {
    const result = await article_comments.getCommentListByArticleId(articleId);
    if (!result) return [];
    const [ rows ] = result;
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const comments: commentItem[] = [];
    const commentMap: Record<string, commentItem> = {};
    rows.forEach(comment => {
        commentMap[comment.comment_id] = comment;
        comment.children = [];
    });
    rows.forEach(comment => {
        if (comment.parent_comment_id === null) {
            if(comment.is_deleted === 0) comments.push(comment);
            return;
        }
        const parentComment = commentMap[comment.parent_comment_id];
        if (parentComment) {
            parentComment.children.push(comment);
            comment.replyComment = {
                id: parentComment.comment_id,
                userInfo: parentComment.userInfo,
            };
        }
    });
    return comments;
}
