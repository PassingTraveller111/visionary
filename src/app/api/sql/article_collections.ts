import {query} from "@/app/api/utils";


const insertArticleCollection = async (userId: number, articleId: number) => {
    return (await query(`INSERT INTO article_collections SET user_id = ?, article_id = ?`, [userId, articleId])) as [{ insertId: number }] | null;
}

const deleteArticleCollection = async (userId: number, articleId: number) => {
    return (await query(`DELETE FROM article_collections where article_id = ? AND user_id = ?`, [articleId, userId]));
}

const getArticleIsCollected = async (userId: number, articleId: number) => {
    return (await query(`
                        SELECT 
                            CASE
                               WHEN COUNT(*) >= 1 THEN 1
                               ELSE 0
                            END AS isCollected
                        FROM article_collections
                        where user_id = 1
                        AND article_id = 25
                    `, [userId, articleId])) as [ [ { isCollected: number } ] ] | null;
}

export const article_collections = {
    insertArticleCollection,
    deleteArticleCollection,
    getArticleIsCollected,
}