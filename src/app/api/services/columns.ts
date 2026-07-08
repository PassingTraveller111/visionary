import {columns} from "@/app/api/sql/columns";
import {columnsTableType} from "@/app/api/sql/type";

export type getColumnsByUserIdReqType = {
    userId: number;
}

export type getColumnsByUserIdResType = {
    msg: 'success' | 'error',
    data: columnsTableType[],
}

export type getColumnReqType = {
    column_id: number;
}

export const getColumnsByUserId = async (userId: number) => {
    const result = await columns.getColumnsByUserId(userId);
    if (!result) return null;
    const [ rows ] = result;
    return Array.isArray(rows) ? rows : null;
}

export const getColumn = async (columnId: number) => {
    const result = await columns.getColumn(columnId);
    if (!result) return null;
    const [ rows ] = result;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}
