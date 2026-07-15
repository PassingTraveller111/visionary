//根据分页查询用户列表
import { query } from "@/server/db/query";
import {articleTableType} from "@/server/sql/type";

type publishedItemType = Pick<articleTableType, 'id' | 'title' | 'review_status' | 'review_id' | 'updated_time' | 'draft_id' | 'is_published' | 'published_time' | 'author_nickname' | 'author_id' | 'summary' | 'tags' | 'cover'> & {
    like_count: number;
    look_count: number;
};

export type ArticleListSort = 'new' | 'hot';

const normalizePagination = (pageNum: number, pageSize: number) => {
    const safePageNum = Number.isInteger(pageNum) && pageNum >= 0 ? pageNum : 0;
    const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 8;
    return {
        offset: safePageNum * safePageSize,
        pageSize: safePageSize,
    };
}

const getPublishedArticlesList = async (pageNum: number, pageSize: number, sort: ArticleListSort = 'new') => {
    const pagination = normalizePagination(pageNum, pageSize);
    const orderBy = sort === 'hot'
        ? `ORDER BY (COALESCE(l.like_count, 0) * 3 + COALESCE(r.look_count, 0)) DESC, a.updated_time DESC, a.id DESC`
        : `ORDER BY a.updated_time DESC, a.id DESC`;

    return await query(`SELECT a.id,
                               a.title,
                               a.review_status,
                               a.review_id,
                               a.updated_time,
                               a.draft_id,
                               a.is_published,
                               a.published_time,
                               a.author_nickname,
                               a.author_id,
                               a.summary,
                               a.tags,
                               a.cover,
                               COALESCE(l.like_count, 0) AS like_count,
                               COALESCE(r.look_count, 0) AS look_count
                        FROM articles a
                                 LEFT JOIN (
                                     SELECT article_id, COUNT(*) AS like_count
                                     FROM article_likes
                                     GROUP BY article_id
                                 ) l ON a.id = l.article_id
                                 LEFT JOIN (
                                     SELECT article_id, COUNT(*) AS look_count
                                     FROM article_reading_records
                                     GROUP BY article_id
                                 ) r ON a.id = r.article_id
                        WHERE a.is_published = 1 AND a.view_permission = 'all'
                        ${orderBy}
                        LIMIT ${pagination.offset}, ${pagination.pageSize}`) as null | [publishedItemType[]];
}

const getPublishedArticleCount = async () => {
    return (await query(`SELECT COUNT(*) as recordCounts FROM articles WHERE is_published = 1 AND view_permission = 'all'`)) as null | [[{ recordCounts: number }]];
}

const getArticleListByKeyWord = async (keyword: string, pageNum: number, pageSize: number) => {
    const pagination = normalizePagination(pageNum, pageSize);
    const fuzzyKeyword = `%${keyword}%`;
    return await query(`SELECT id, title, review_status, review_id, updated_time, draft_id, is_published, published_time, author_nickname, author_id, summary, cover, tags,
                        (
                            -- 标题中关键字出现次数得分，权重设为 3
                            (LENGTH(title) - LENGTH(REPLACE(title, ?, ''))) / LENGTH(?) * 3 +
                            -- 摘要中关键字出现次数得分，权重设为 2
                            (LENGTH(summary) - LENGTH(REPLACE(summary, ?, ''))) / LENGTH(?) * 2 +
                            -- 正文中关键字出现次数得分，权重设为 1
                            (LENGTH(content) - LENGTH(REPLACE(content, ?, ''))) / LENGTH(?) * 1
                        ) AS score
                        FROM articles
                        WHERE (title LIKE ? OR content LIKE ? OR articles.summary LIKE ?) AND is_published = 1 AND view_permission = 'all'
                        ORDER BY  score DESC
                        LIMIT ${pagination.offset}, ${pagination.pageSize}`
        , [keyword, keyword, keyword, keyword, keyword, keyword, fuzzyKeyword, fuzzyKeyword, fuzzyKeyword]) as null | [publishedItemType[]];
}

const getArticleCountByUserId = async (userId: number) => {
    return (await query(`SELECT COUNT(*) as articleCounts FROM articles WHERE author_id = ?`, [userId])) as null | [[{ articleCounts: number }]];
}

const getArticleToAddColumn = async (userId: number) => {
    return (await query(`SELECT a.id, a.title, a.updated_time
                         FROM articles a
                        -- 左连接 article_columns 表
                                  LEFT JOIN article_columns ac ON a.id = ac.article_id
                         WHERE a.author_id = ?
                        -- 按文章 ID 分组
                         GROUP BY a.id
                        -- 筛选关联 column 数小于 3 的文章
                         HAVING COUNT(ac.column_id) < 3
                         `, [userId]))
}

const getArticleListByColumnId = async (column_id: number, includeUnpublished = false) => {
    const publishedFilter = includeUnpublished ? '' : 'AND a.is_published = 1';
    return (await query(`SELECT a.id, a.title, a.updated_time, a.cover, a.summary, a.tags 
                          FROM articles a
                          LEFT JOIN article_columns ac ON a.id = ac.article_id
                          WHERE ac.column_id = ? ${publishedFilter}
                          GROUP BY a.id
                          `, [column_id]))
}
export const article = {
    getPublishedArticlesList,
    getPublishedArticleCount,
    getArticleListByKeyWord,
    getArticleCountByUserId,
    getArticleToAddColumn,
    getArticleListByColumnId,
}
