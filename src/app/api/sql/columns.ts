import {query} from "@/app/api/utils";
import {columnsTableType} from "@/app/api/sql/type";


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


export const columns = {
    insertColumn,
    updateColumn,
    deleteColumn,
    getColumnsByUserId,
}