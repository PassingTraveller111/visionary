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
};

const useStore = create<RFState>((set, get) => ({
    nodes: [
        {
            id: '1',
            position: { x: 0, y: 0 },
            data: { label: '1' },
            type: 'flow',
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
    updateNodeLabel: (nodeId: string, label: string) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    // it's important to create a new node here, to inform React Flow about the changes
                    return {
                        ...node,
                        data: { ...node.data, label },
                    };
                }

                return node;
            }),
        });
    },
    /*
    * 侧边栏开始拖拽元素
    * */
    onSideBarDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        set({
            sidebarDragType: nodeType,
        })
        event.dataTransfer.effectAllowed = 'move';
    },
    /*
    * 添加节点
    * */
    addNode: (newNode: FlowNode) => {
        // 添加结点
        set({
            nodes: [...get().nodes, newNode],
        });
    },
    setEdges: (callback) => {
        const newEdges = callback(get().edges);
        set({
            edges: [...newEdges],
        })
    }
}));

export default useStore;
