//根据分页查询用户列表
import { query } from "@/app/api/utils";
import { publishedItemType } from "@/app/api/protected/article/getPublishedArticleList/route";

const getPublishedArticlesList = async (pageNum: number, pageSize: number) => {
    const offset = pageNum * pageSize;
    return await query(`SELECT id, title, views, review_status, review_id, updated_time, draft_id, is_published, published_time, author_nickname, author_id, summary
                        FROM articles WHERE is_published = 1 ORDER BY  updated_time DESC LIMIT ${offset},${pageSize}`) as null | publishedItemType[];
}

const getPublishedArticleCount = async () => {
    return (await query(`SELECT COUNT(*) as recordCounts FROM articles where is_published = 1`)) as null | [[{ recordCounts: number }]];
}
export const article = {
    getPublishedArticlesList,
    getPublishedArticleCount
}