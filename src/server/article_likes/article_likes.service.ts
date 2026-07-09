import {article_likes} from "@/server/sql/article_likes";
import {redisInstance} from "@/server/redis/keys";
import type {ArticleLikeCount, ArticleLikeState} from "@/shared/api/article_likes";

export const getArticleIsLike = async (userId: number, articleId: number): Promise<ArticleLikeState | null> => {
    const results = await article_likes.getArticleIsLike(userId, articleId);
    if (!results) return null;

    const [ rows ] = results;
    if (Array.isArray(rows) && rows.length >= 1) {
        return {
            isLike: true,
            like_at: rows[0].like_at,
        };
    }

    return { isLike: false };
}

export const setArticleIsLike = async (userId: number, articleId: number, isLike: boolean): Promise<ArticleLikeState | null> => {
    const results = await article_likes.setArticleIsLike(userId, articleId, isLike);
    if (!results) return null;

    await redisInstance.getArticleLikeCountByUserId.deleteRedisValue({ userId });
    return { isLike };
}

export const getArticleLikeCountByUserId = async (userId: number): Promise<ArticleLikeCount | null> => {
    const results = await article_likes.getArticleLikeCountByUserId(userId);
    if (!results) return null;

    const [ rows ] = results;
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const data = rows[0] as ArticleLikeCount;
    await redisInstance.getArticleLikeCountByUserId.setRedisValue({ userId }, data);
    return data;
}
