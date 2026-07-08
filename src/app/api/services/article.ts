import pool from "@/lib/db";
import {article} from "@/app/api/sql/article";
import {columns} from "@/app/api/sql/columns";
import {articleTableType} from "@/app/api/sql/type";

export type getArticleRequestType = {
    articleId: number;
}

export type getArticleResponseType = {
    msg: 'success' | 'error';
    data: articleTableType;
}

export type getArticleListRequestType = {
    authorId: number;
}

export type itemType = Pick<articleTableType, 'id' | 'title' | 'review_status' | 'review_id' | 'updated_time' | 'draft_id' | 'is_published' | 'published_time'>;

export type getArticleListResponseType = {
    msg: 'success' | 'error';
    data: itemType[];
}

export type getPublishedArticleListRequestType = {
    pageNum: number;
    pageSize: number;
}

export type publishedItemType = Pick<articleTableType, 'id' | 'title' | 'review_status' | 'review_id' | 'updated_time' | 'draft_id' | 'is_published' | 'published_time' | 'author_nickname' | 'author_id' | 'summary' | 'tags' | 'cover'> & {
    like_count: number;
    look_count: number;
};

export type getPublishedArticleListResponseType = {
    msg: 'success' | 'error';
    data: publishedItemType[];
    total?: number;
    pageNum?: number;
    pageSize?: number;
}

export type getArticleListByKeyWordRequestType = {
    pageNum: number;
    pageSize: number;
    keyword: string;
}

export type ItemType = publishedItemType;

export type getArticleListByKeyWordResponseType = {
    msg: 'success' | 'error';
    data: ItemType[];
    total?: number;
    pageNum?: number;
    pageSize?: number;
}

export type getArticleCountByUserIdRequest = {
    userId: number;
}

export type getArticleCountByUserIdResponse = {
    msg: 'success';
    data: {
        articleCounts: number;
    };
} | {
    msg: 'error';
}

export type getArticleListByColumnIdReqType = {
    column_id: number;
}

export type getArticleListByColumnIdResType = {
    msg: 'success' | 'error';
    data: {
        id: number;
        title: string;
        summary: string;
        tags: string[];
        cover: string;
        updated_time: string;
    }[];
}

export const getArticle = async (articleId: number, viewerUserId = 0) => {
    const connection = await pool.getConnection();
    try {
        const sql = `SELECT * FROM articles WHERE id = ? AND ((is_published = 1 AND view_permission = 'all') OR author_id = ?)`;
        const [ rows ] = await connection.execute(sql, [articleId, viewerUserId]);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] as articleTableType : null;
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
        return rows as itemType[];
    } finally {
        connection.release();
    }
}

export const getPublishedArticleList = async (pageNum: number, pageSize: number) => {
    const results = await article.getPublishedArticlesList(pageNum, pageSize);
    const total = await article.getPublishedArticleCount();
    if (!results || !total) return null;
    const [ rows ] = results;
    const [ [ { recordCounts } ] ] = total;
    return {
        rows: rows as publishedItemType[],
        total: recordCounts,
    };
}

export const getArticleListByKeyWord = async (keyword: string, pageNum: number, pageSize: number) => {
    const result = await article.getArticleListByKeyWord(keyword, pageNum, pageSize);
    if (!result) return null;
    const [ rows ] = result;
    return rows as ItemType[];
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
    return Array.isArray(rows) ? rows as getArticleListByColumnIdResType['data'] : null;
}
