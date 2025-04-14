import {
    Edge,
    EdgeChange,
    NodeChange,
    OnNodesChange,
    OnEdgesChange,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';
import { create } from 'zustand';

import { type FlowNode } from './types';


export type RFState = {
    nodes: FlowNode[];
    edges: Edge[];
    sidebarDragType: string;
    onNodesChange: OnNodesChange<FlowNode>;
    onEdgesChange: OnEdgesChange;
    updateNodeLabel: (nodeId: string, label: string) => void;
    onSideBarDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void;
    addNode: (newNode: FlowNode) => void;
    setEdges: (callback: (edges: Edge[]) => Edge[]) => void;
    updateNodesInputStyles: (
        nodeIds: string[],
        styles?: {
            align?: 'center' | 'left' | 'right',
            verticalAlign?: 'center' | 'top' | 'bottom',
        }
    ) => void;
};

const useStore = create<RFState>((set, get) => ({
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
            position: { x: 100, y: 100 },
            data: { label: '123' },
            type: 'flow',
        }
    ],
    edges: [],
    sidebarDragType: '',
    onNodesChange: (changes: NodeChange<FlowNode>[]) => {
        set({
            nodes: applyNodeChanges<FlowNode>(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    /**
     * 更新节点的label
     * */
    updateNodeLabel: (nodeId: string, label: string) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: { ...node.data, label },
                    };
                }

                return node;
            }),
        });
    },
    /**
    * 侧边栏开始拖拽元素
    * */
    onSideBarDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        set({
            sidebarDragType: nodeType,
        })
        event.dataTransfer.effectAllowed = 'move';
    },
    /**
    * 添加节点
    * */
    addNode: (newNode: FlowNode) => {
        // 添加结点
        set({
            nodes: [...get().nodes, newNode],
        });
    },
    /**
     * 修改边
     * */
    setEdges: (callback) => {
        const newEdges = callback(get().edges);
        set({
            edges: [...newEdges],
        })
    },
    updateNodesInputStyles: (
        nodeIds: string[],
        styles?: {
            align?: 'center' | 'left' | 'right',
            verticalAlign?: 'center' | 'top' | 'bottom',
        }
    ) => {
        set({
            nodes: get().nodes.map((node) => {
                if (nodeIds.includes(node.id)) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            inputStyles: {
                                ...node.data.inputStyles,
                                align: styles?.align ?? node.data.inputStyles?.align,
                                verticalAlign: styles?.verticalAlign ?? node.data.inputStyles?.verticalAlign,
                            }
                        },
                    };
                }
                return node;
            }),
        });
    },
}));

export default useStore;
