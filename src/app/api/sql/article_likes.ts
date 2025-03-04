import {query} from "@/app/api/utils";
import {articleLikesTableType} from "@/app/api/protected/article_likes/type";


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

export const article_likes = {
    getArticleIsLike,
    setArticleIsLike,
}