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
                WHERE article_id = ?`
        , [articleId])) as [ commentItem[] ] | null
}

export const article_comments = {
    sendArticleComment,
    getCommentListByArticleId,
}