import {NextRequest, NextResponse} from "next/server";
import {diagramTableType} from "@/app/api/sql/type";
import {diagram} from "@/app/api/sql/diagram";
import {MarkerType} from "@xyflow/react";
import {verifyToken} from "@/utils/auth";

export type updateDiagramReqType = {
    id: number | 'new';
} & Pick<diagramTableType, 'type' | 'data' | 'intro' | 'tags' | 'title' | 'author_id' | 'cover'>


export async function POST(req: NextRequest) {
    try {
        const data: updateDiagramReqType = await req.json();
        const { id } = data;
        const token = req.cookies.get('token')?.value ?? '';
        const { userId } = verifyToken(token);
        if (id === 'new') {
            const initData = {
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
                        target: "3",
                        targetHandle: "top-target",
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
                            strokeWidth: 2
                        }
                    }
                ],
            };
            const result = await diagram.insertDiagram({
                ...data,
                data: JSON.stringify(initData),
            });
            if (result) {
                const [ rows ] = result;
                return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
            }
        } else {
            const result = await diagram.updateDiagram({
                ...data,
                id: data.id as number,
            }, userId);
            if (result) {
                const [ rows] = result;
                return NextResponse.json({ msg: 'success', data: rows }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'error' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}