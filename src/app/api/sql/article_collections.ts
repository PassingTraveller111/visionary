import {query} from "@/app/api/utils";
import {article_collectionsTableType, articleTableType} from "@/app/api/sql/type";


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
                        where user_id = ?
                        AND article_id = ?
                    `, [userId, articleId])) as [ [ { isCollected: number } ] ] | null;
}

const getArticleCollectionsByUserId = async (userId: number) => {
    return (await query(`
                        SELECT
                            ac.article_id,
                            ac.collect_time,
                            a.title,
                            a.tags,
                            a.summary,
                            a.cover,
                            u.nick_name AS author_name,
                            COALESCE(like_subquery.like_count, 0) AS like_count,
                            COALESCE(look_subquery.look_count, 0) AS look_count
                        FROM
                            article_collections AS ac
                        LEFT JOIN
                            articles AS a ON ac.article_id = a.id
                        LEFT JOIN
                            users AS u ON u.id = a.author_id
                        -- 连接点赞数子查询
                        LEFT JOIN (
                                SELECT
                                    article_id,
                                    COUNT(id) AS like_count
                                FROM
                                    article_likes
                                GROUP BY
                                    article_id
                            ) AS like_subquery ON a.id = like_subquery.article_id
                        -- 连接阅读数子查询
                        LEFT JOIN (
                                SELECT
                                    article_id,
                                    COUNT(record_id) AS look_count
                                FROM
                                    article_reading_records
                                GROUP BY
                                    article_id
                            ) AS look_subquery ON a.id = look_subquery.article_id
                        WHERE
                            ac.user_id = ? AND a.is_published = 1
                        GROUP BY
                            ac.article_id,
                            ac.collect_time,
                            a.title,
                            a.tags,
                            a.summary,
                            u.nick_name; 
                        `, [userId])) as [
                            (Pick<article_collectionsTableType, 'article_id' | 'collect_time'> & Pick<articleTableType, 'title' | 'tags' | 'summary'>
                                & { author_mame: string, like_count: number, look_count: number })[]
                        ] | null;
}

export const article_collections = {
    insertArticleCollection,
    deleteArticleCollection,
    getArticleIsCollected,
    getArticleCollectionsByUserId,
}