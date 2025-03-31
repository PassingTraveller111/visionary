import {query} from "@/app/api/utils";
import {columnsTableType} from "@/app/api/sql/type";


const updateColumn = async () => {

}

const insertColumn = async (column_name: string, author_id: number, description: string, cover_image?: string) => {
    const columns = ['column_name', 'author_id', 'description'];
    const values = [column_name, author_id, description];

    if (cover_image!== undefined && cover_image!== null) {
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

const deleteColumn = async (column_id: number) => {}

const getColumnsByUserId = async (userId: number) => {
    return (await query(`SELECT * FROM columns where author_id = ?`, [userId])) as [ columnsTableType[] ] | null
}


export const columns = {
    insertColumn,
    updateColumn,
    deleteColumn,
    getColumnsByUserId,
}