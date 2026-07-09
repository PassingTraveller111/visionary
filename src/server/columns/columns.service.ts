import type {Key} from "react";
import pool from "@/lib/db";
import {columns} from "@/server/sql/columns";
import {uploadImageToCos} from "@/server/cos/upload";
import type {UpdateColumnRequest} from "@/shared/api/columns";

export const getColumnsByUserId = async (userId: number) => {
    const result = await columns.getColumnsByUserId(userId);
    if (!result) return null;
    const [ rows ] = result;
    return Array.isArray(rows) ? rows : null;
}

export const getColumnById = async (columnId: number) => {
    const result = await columns.getColumn(columnId);
    if (!result) return null;
    const [ rows ] = result;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export const upsertColumn = async (data: UpdateColumnRequest, userId: number) => {
    if (data.column_id) {
        return columns.updateColumn(data.column_id, data.column_name, userId, data.description, data.cover_image);
    }

    const result = await columns.insertColumn(data.column_name, userId, data.description, data.cover_image);
    if (!result) return null;
    const [ { insertId } ] = result;
    return { insertId };
}

export const deleteColumnById = async (columnId: number, userId: number) => {
    return columns.deleteColumn(columnId, userId);
}

export const updateColumnArticleList = async (columnId: number, articleIds: Key[]) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute('DELETE FROM article_columns WHERE column_id = ?', [columnId]);

        if (articleIds.length > 0) {
            const values = articleIds.map(articleId => [articleId, columnId]);
            await connection.query('INSERT INTO article_columns (article_id, column_id) VALUES ?', [values]);
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export const uploadColumnCover = async (userId: number, file: File) => {
    const result = await uploadImageToCos(file, `column_cover/${userId}-${Date.now()}-${file.name}`);
    if (result.statusCode !== 200) throw new Error('上传失败');
    return result;
}
