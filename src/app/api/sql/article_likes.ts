import {query} from "@/app/api/utils";
import {articleLikesTableType} from "@/app/api/sql/type";


const getArticleIsLike = async (userId: number, articleId: number) => {
    return await query(`SELECT * FROM article_likes WHERE article_id = ? AND user_id = ?`, [articleId, userId]) as articleLikesTableType[] | null;
}

const setArticleIsLike = async (userId: number, articleId: number, isLike: boolean) => {
    if (isLike) {
        // 点赞
        return await query(`INSERT INTO article_likes (article_id, user_id, liked_at) VALUES (?, ?, ?)`, [articleId, userId, new Date()]);
    } else {
        // 取消点赞
        return await query(`DELETE FROM article_likes WHERE article_id = ? AND user_id = ?`, [articleId, userId]);
    }
}

const getArticleLikeCountByUserId = async (userId: number) => {
    return (await query(`SELECT
                             u.id AS userId,
                             COUNT(al.id) AS like_count
                         FROM
                             users u
                                 LEFT JOIN
                             articles a ON u.id = a.author_id
                                 LEFT JOIN
                             article_likes al ON a.id = al.article_id
                         WHERE
                             u.id = ?
                         GROUP BY
                             u.id;
                        `, [userId])) as [ { userId: number, like_count: number }[] ] | null
}


export const article_likes = {
    getArticleIsLike,
    setArticleIsLike,
    getArticleLikeCountByUserId,
}