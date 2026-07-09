import {MarkerType} from "@xyflow/react";
import pool from "@/lib/db";
import {diagram} from "@/app/api/sql/diagram";
import {uploadImageToCos} from "@/server/cos/upload";
import type {DiagramDto, UpdateDiagramRequest} from "@/shared/api/diagrams";

const initDiagramData = {
    nodes: [
        {
            id: '1',
            position: { x: 0, y: 0 },
            data: {
                label: '睡觉啊看了房间阿斯科利反馈啦',
                inputStyles: {
                    align: 'left',
                    verticalAlign: 'top',
                },
            },
            type: 'flow',
            style: {
                width: '100px',
                height: '100px',
                padding: '2px',
            },
        },
        {
            id: '2',
            position: { x: 0, y: 100 },
            data: { label: '2' },
            type: 'flow',
        },
        {
            id: '3',
            position: { x: 200, y: 200 },
            data: { label: '123' },
            type: 'flow',
        }
    ],
    edges: [
        {
            id: '4',
            source: '1',
            sourceHandle: 'right-source',
            target: '3',
            targetHandle: 'top-target',
            data: {
                label: '111',
                type: 'SmoothStep',
            },
            type: 'flow',
            markerEnd: {
                type: MarkerType.Arrow,
            },
            style: {
                stroke: '#c8dc8b',
                strokeWidth: 2,
            },
        },
    ],
};

export const upsertDiagram = async (data: UpdateDiagramRequest, userId: number) => {
    if (data.id === 'new') {
        const result = await diagram.insertDiagram({
            ...data,
            author_id: userId,
            data: JSON.stringify(initDiagramData),
        });
        if (!result) return null;
        const [ rows ] = result;
        return rows;
    }

    const result = await diagram.updateDiagram({
        ...data,
        id: data.id,
    }, userId);
    if (!result) return null;
    const [ rows ] = result;
    return rows;
}

export const getDiagramById = async (id: number, userId: number) => {
    const result = await diagram.getDiagram(id, userId);
    if (!result) return null;
    const [ rows ] = result;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] as DiagramDto : null;
}

export const getDiagramsByUserId = async (userId: number) => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT * FROM diagrams WHERE author_id = ? ORDER BY update_time DESC`, [userId]);
        return Array.isArray(rows) ? rows as DiagramDto[] : [];
    } finally {
        connection.release();
    }
}

export const deleteDiagramById = async (id: number, userId: number) => {
    return diagram.deleteDiagram(id, userId);
}

export const renameDiagramById = async (title: string, id: number, userId: number) => {
    const result = await diagram.renameDiagram(title, id, userId);
    if (!result) return null;
    const [ rows ] = result;
    return rows;
}

export const getDiagramCoverById = async (id: number) => {
    const result = await diagram.getDiagramCoverById(id);
    if (!result) return null;
    const [ rows ] = result;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export const uploadDiagramCover = async (userId: number, diagramId: string, file: File) => {
    const result = await uploadImageToCos(file, `diagram_cover/${userId}-${diagramId}`);
    if (result.statusCode !== 200) throw new Error('上传失败');
    return result;
}
