import {query} from "@/server/db/query";
import {columnsTableType} from "@/server/sql/type";
import type {PublicColumnDto} from "@/shared/api/columns";


const updateColumn = async (column_id: number, column_name: string, author_id: number, description: string, cover_image?: string) => {
    const columns = ['column_name', 'description', 'cover_image'];
    const setClause = columns.map((col) => `${col} = ?`).join(', ');
    const cover = cover_image ? cover_image : 'https://visionary-1305469650.cos.ap-beijing.myqcloud.com/column_cover%2Fdefault.png';
    const values = [column_name, description, cover, author_id, column_id];
    return (await query(`UPDATE columns SET ${setClause} WHERE author_id = ? AND column_id = ?`, values))
}

const insertColumn = async (column_name: string, author_id: number, description: string, cover_image?: string) => {
    const columns = ['column_name', 'author_id', 'description'];
    const values = [column_name, author_id, description];
    if (cover_image!== undefined && cover_image!== null && cover_image !== '') {
        columns.push('cover_image');
        values.push(cover_image);
    }

    const columnNames = columns.join(', ');
    const placeholders = columns.map(() => '?').join(', ');

    return (await query(`
                INSERT INTO columns (${columnNames})
                VALUES (${placeholders})
            `, values)) as [ { insertId: number } ] | null
}

const deleteColumn = async (column_id: number, userId: number) => {
    return (await query(`DELETE FROM columns WHERE column_id = ? AND author_id = ?`, [column_id, userId]));
}

const getColumnsByUserId = async (userId: number) => {
    return (await query(`SELECT * FROM columns where author_id = ?`, [userId])) as [ columnsTableType[] ] | null
}

const getColumn = async (column_id: number) => {
    return (await query(`SELECT * FROM columns where column_id = ?`, [column_id])) as [ [ columnsTableType ] ] | null
}

const getPublicColumns = async (pageNum: number, pageSize: number) => {
    const offset = pageNum * pageSize;
    return await query(`SELECT c.column_id,
                               c.column_name,
                               c.cover_image,
                               c.author_id,
                               c.description,
                               c.created_at,
                               COUNT(DISTINCT a.id) AS article_count,
                               MAX(a.updated_time) AS latest_article_updated_at
                        FROM columns c
                                 INNER JOIN article_columns ac ON ac.column_id = c.column_id
                                 INNER JOIN articles a ON a.id = ac.article_id
                            AND a.is_published = 1
                            AND a.view_permission = 'all'
                        GROUP BY c.column_id,
                                 c.column_name,
                                 c.cover_image,
                                 c.author_id,
                                 c.description,
                                 c.created_at
                        ORDER BY latest_article_updated_at DESC, c.column_id DESC
                        LIMIT ${offset}, ${pageSize}`) as [PublicColumnDto[]] | null;
}

const getPublicColumnCount = async () => {
    return await query(`SELECT COUNT(DISTINCT c.column_id) AS recordCounts
                        FROM columns c
                                 INNER JOIN article_columns ac ON ac.column_id = c.column_id
                                 INNER JOIN articles a ON a.id = ac.article_id
                            AND a.is_published = 1
                            AND a.view_permission = 'all'`) as [[{recordCounts: number}]] | null;
}


export const columns = {
    insertColumn,
    updateColumn,
    deleteColumn,
    getColumnsByUserId,
    getColumn,
    getPublicColumns,
    getPublicColumnCount,
}
