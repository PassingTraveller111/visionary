import {article_comments} from "@/server/sql/article_comments";
import type {CommentItem} from "@/shared/api/article_comments";

export const getCommentListByArticleId = async (articleId: number): Promise<CommentItem[]> => {
    const result = await article_comments.getCommentListByArticleId(articleId);
    if (!result) return [];

    const [ rows ] = result;
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const comments: CommentItem[] = [];
    const commentMap: Record<number, CommentItem> = {};
    rows.forEach(comment => {
        const item = comment as CommentItem;
        commentMap[item.comment_id] = item;
        item.children = [];
    });
    rows.forEach(comment => {
        const item = comment as CommentItem;
        if (item.parent_comment_id === null) {
            if(item.is_deleted === 0) comments.push(item);
            return;
        }
        const parentComment = commentMap[item.parent_comment_id];
        if (parentComment) {
            parentComment.children.push(item);
            item.replyComment = {
                id: parentComment.comment_id,
                userInfo: parentComment.userInfo,
            };
        }
    });
    return comments;
}

export const sendArticleComment = async (userId: number, articleId: number, commentText: string, parentCommentId?: number) => {
    return article_comments.sendArticleComment(userId, articleId, commentText, parentCommentId);
}

export const deleteComment = async (commentId: number, userId: number) => {
    return article_comments.deleteComment(commentId, userId);
}
