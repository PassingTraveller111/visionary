import {query} from "@/app/api/utils";
import {commentItem} from "@/app/api/protected/article_comments/getCommentListByArticleId/route";


const sendArticleComment = async (userId: number, articleId: number, commentText: string, parentCommentId?: number ) => {
    return (await query(`
        INSERT INTO article_comments (user_id, article_id, comment_text, parent_comment_id) VALUES (?,?,?,?)
    `,[userId, articleId, commentText, parentCommentId ?? null]))
}
const getCommentListByArticleId = async (articleId: number) => {
    return (await query(`
                SELECT ac.*,
                       JSON_OBJECT('nickname', u.nick_name, 'id', u.id, 'avatar', u.\`profile\`) AS userInfo
                FROM article_comments AS ac
                         LEFT JOIN
                     users AS u ON ac.user_id = u.id
                WHERE article_id = ? AND is_deleted = 0`
        , [articleId])) as [ commentItem[] ] | null
}

const deleteComment = async (comment_id: number, userId: number) => {
    return (await query(`UPDATE article_comments
                         SET is_deleted = 1
                         WHERE comment_id = ? AND user_id = ?
                    `, [comment_id, userId]));
}

export const article_comments = {
    sendArticleComment,
    getCommentListByArticleId,
    deleteComment,
}