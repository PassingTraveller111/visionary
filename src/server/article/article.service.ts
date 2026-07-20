import {randomUUID} from "crypto";
import type {PoolConnection} from "mysql2/promise";
import {revalidatePath} from "next/cache";
import pool from "@/lib/db";
import {article, type ArticleListSort} from "@/server/sql/article";
import {columns} from "@/server/sql/columns";
import {uploadImageToCos} from "@/server/cos/upload";
import type {ArticleDto, ArticleListItemDto, ColumnArticleItemDto, PublishedArticleItemDto} from "@/shared/api/article";

export type DeleteArticleRequest = {
    articleId: number;
};

export type ArticleSitemapItem = {
    id: number;
    updated_time: Date | string | null;
};

export const getArticle = async (articleId: number, viewerUserId = 0) => {
    const connection = await pool.getConnection();
    try {
        const sql = `SELECT * FROM articles WHERE id = ? AND ((is_published = 1 AND view_permission = 'all') OR author_id = ?)`;
        const [ rows ] = await connection.execute(sql, [articleId, viewerUserId]);
        if (!Array.isArray(rows) || rows.length === 0) return null;
        const article = rows[0] as ArticleDto;
        return {
            ...article,
            ...await getArticleMeta(articleId, connection),
        };
    } finally {
        connection.release();
    }
}

export const getPublishedPublicArticle = async (articleId: number) => {
    const connection = await pool.getConnection();
    try {
        const sql = `SELECT * FROM articles WHERE id = ? AND is_published = 1 AND view_permission = 'all'`;
        const [ rows ] = await connection.execute(sql, [articleId]);
        if (!Array.isArray(rows) || rows.length === 0) return null;
        const article = rows[0] as ArticleDto;
        return {
            ...article,
            ...await getArticleMeta(articleId, connection),
        };
    } finally {
        connection.release();
    }
}

const getArticleMeta = async (articleId: number, connection: PoolConnection) => {
    const [readRows] = await connection.execute(
        `SELECT COUNT(*) AS look_count FROM article_reading_records WHERE article_id = ?`,
        [articleId]
    );
    const [columnRows] = await connection.execute(
        `SELECT c.column_id, c.column_name
         FROM article_columns ac
                  INNER JOIN columns c ON c.column_id = ac.column_id
         WHERE ac.article_id = ?
         ORDER BY c.created_at DESC`,
        [articleId]
    );

    const lookCount = Array.isArray(readRows) && readRows.length > 0
        ? Number((readRows[0] as { look_count: number }).look_count)
        : 0;

    return {
        look_count: lookCount,
        columns: Array.isArray(columnRows) ? columnRows as ArticleDto['columns'] : [],
    };
}

export const getPublishedPublicArticleSitemapItems = async () => {
    const connection = await pool.getConnection();
    try {
        const sql = `SELECT id, updated_time FROM articles WHERE is_published = 1 AND view_permission = 'all' ORDER BY updated_time DESC`;
        const [ rows ] = await connection.execute(sql);
        return Array.isArray(rows) ? rows as ArticleSitemapItem[] : [];
    } finally {
        connection.release();
    }
}

export const getArticleList = async (authorId: number, viewerUserId = 0) => {
    const connection = await pool.getConnection();
    try {
        const isOwn = viewerUserId === authorId;
        const sql = isOwn
            ? `SELECT id, title, review_status, review_id, updated_time, draft_id, is_published, published_time FROM articles WHERE author_id = ? ORDER BY updated_time DESC`
            : `SELECT id, title, review_status, review_id, updated_time, draft_id, is_published, published_time FROM articles WHERE author_id = ? AND is_published = 1 ORDER BY updated_time DESC`;
        const [ rows ] = await connection.execute(sql, [authorId]);
        return rows as ArticleListItemDto[];
    } finally {
        connection.release();
    }
}

export const getPublishedArticleList = async (pageNum: number, pageSize: number, sort: ArticleListSort = 'new') => {
    const results = await article.getPublishedArticlesList(pageNum, pageSize, sort);
    const total = await article.getPublishedArticleCount();
    if (!results || !total) return null;
    const [ rows ] = results;
    const [ [ { recordCounts } ] ] = total;
    return {
        rows: rows as PublishedArticleItemDto[],
        total: recordCounts,
    };
}

export const getArticleListByKeyWord = async (keyword: string, pageNum: number, pageSize: number) => {
    const result = await article.getArticleListByKeyWord(keyword, pageNum, pageSize);
    if (!result) return null;
    const [ rows ] = result;
    return rows as PublishedArticleItemDto[];
}

export const getArticleCountByUserId = async (userId: number, viewerUserId = 0) => {
    const connection = await pool.getConnection();
    try {
        const sql = viewerUserId === userId
            ? `SELECT COUNT(*) as articleCounts FROM articles WHERE author_id = ?`
            : `SELECT COUNT(*) as articleCounts FROM articles WHERE author_id = ? AND is_published = 1`;
        const [ rows ] = await connection.execute(sql, [userId]);
        return Array.isArray(rows) && rows.length > 0 ? (rows[0] as { articleCounts: number }).articleCounts : null;
    } finally {
        connection.release();
    }
}

export const getArticleListByColumnId = async (columnId: number, viewerUserId = 0) => {
    const columnResult = await columns.getColumn(columnId);
    const [ columnRows ] = columnResult ?? [[]];
    const column = Array.isArray(columnRows) ? columnRows[0] : undefined;
    const includeUnpublished = Boolean(column && column.author_id === viewerUserId);
    const result = await article.getArticleListByColumnId(columnId, includeUnpublished);
    if (!result) return null;
    const [ rows ] = result;
    return Array.isArray(rows) ? rows as ColumnArticleItemDto[] : null;
}

export const deleteArticleById = async (articleId: number) => {
    const connection = await pool.getConnection();
    try {
        const draftId = await getDraftId(articleId, connection);
        await connection.execute(`DELETE FROM articles WHERE id = ?;`, [articleId]);
        if (draftId) await connection.execute(`DELETE FROM drafts WHERE id = ?;`, [draftId]);
        revalidatePath(`/reader/${articleId}`);
        return '删除成功';
    } finally {
        connection.release();
    }
}

const getDraftId = async (articleId: number, connection: PoolConnection) => {
    const [ rows ] = await connection.execute(`SELECT draft_id FROM articles WHERE id = ?`, [articleId]);
    if (Array.isArray(rows) && rows.length > 0) return (rows[0] as { draft_id: number }).draft_id;
    return 0;
}

export const uploadArticleCover = async (userId: number, file: File) => {
    const result = await uploadImageToCos(file, `article_cover/${userId}-${Date.now()}-${file.name}`);
    if (result.statusCode !== 200) throw new Error('上传失败');
    return result;
}

export const uploadArticleImage = async (userId: number, file: File) => {
    const extension = file.type.split('/')[1] || 'png';
    const result = await uploadImageToCos(file, `article/${userId}/${Date.now()}-${randomUUID()}.${extension}`);
    if (result.statusCode !== 200) throw new Error('上传失败');
    return result;
}
