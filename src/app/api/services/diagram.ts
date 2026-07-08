import {diagram} from "@/app/api/sql/diagram";

export type getDiagramCoverByIdReqType = {
    id: number;
}

export type getDiagramCoverByIdResType = {
    msg: 'success' | 'error';
    data: {
        id: number;
        title: string;
        cover: string;
        author_id: number;
    };
}

export const getDiagramCoverById = async (id: number) => {
    const result = await diagram.getDiagramCoverById(id);
    if (!result) return null;
    const [ rows ] = result;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}
