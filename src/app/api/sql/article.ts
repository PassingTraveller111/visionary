//根据分页查询用户列表
import { query } from "@/app/api/utils";
import { publishedItemType } from "@/app/api/protected/article/getPublishedArticleList/route";

const getPublishedArticlesList = async (pageNum: number, pageSize: number) => {
    const offset = pageNum * pageSize;
    return await query(`SELECT a.id, title, views, review_status, review_id, updated_time, draft_id, is_published, published_time, author_nickname, author_id, summary, COUNT(al.id) AS like_count
                        FROM articles a
                        LEFT JOIN article_likes al ON a.id = al.article_id
                        WHERE is_published = 1
                        GROUP BY
                            a.id,
                            a.title,
                            a.views,
                            a.review_status,
                            a.review_id,
                            a.updated_time,
                            a.draft_id,
                            a.is_published,
                            a.published_time,
                            a.author_nickname,
                            a.author_id,
                            a.summary
                        ORDER BY  updated_time DESC LIMIT ${offset},${pageSize}`) as null | publishedItemType[];
}

const getPublishedArticleCount = async () => {
    return (await query(`SELECT COUNT(*) as recordCounts FROM articles where is_published = 1`)) as null | [[{ recordCounts: number }]];
}

const getArticleListByKeyWord = async (keyword: string, pageNum: number, pageSize: number) => {
    const offset = pageNum * pageSize;
    const fuzzyKeyword = `%${keyword}%`;
    return await query(`SELECT id, title, views, review_status, review_id, updated_time, draft_id, is_published, published_time, author_nickname, author_id, summary,
                        (
                            -- 标题中关键字出现次数得分，权重设为 3
                            (LENGTH(title) - LENGTH(REPLACE(title, ?, ''))) / LENGTH(?) * 3 +
                            -- 摘要中关键字出现次数得分，权重设为 2
                            (LENGTH(summary) - LENGTH(REPLACE(summary, ?, ''))) / LENGTH(?) * 2 +
                            -- 正文中关键字出现次数得分，权重设为 1
                            (LENGTH(content) - LENGTH(REPLACE(content, ?, ''))) / LENGTH(?) * 1
                        ) AS score
                        FROM articles
                        WHERE title LIKE ? OR content LIKE ? OR articles.summary LIKE ? AND is_published = 1 
                        ORDER BY  score DESC
                        LIMIT ${offset},${pageSize}`
        , [keyword, keyword, keyword, keyword, keyword, keyword, fuzzyKeyword, fuzzyKeyword, fuzzyKeyword]) as null | publishedItemType[];
}

const getArticleCountByUserId = async (userId: number) => {
    return (await query(`SELECT COUNT(*) as articleCounts FROM articles WHERE author_id = ?`, [userId])) as null | [[{ articleCounts: number }]];
}

export const article = {
    getPublishedArticlesList,
    getPublishedArticleCount,
    getArticleListByKeyWord,
    getArticleCountByUserId,
}