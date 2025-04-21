import {
    applyEdgeChanges,
    applyNodeChanges,
    EdgeChange,
    NodeChange,
    OnEdgesChange,
    OnNodesChange,
} from '@xyflow/react';
import {create} from 'zustand';

import {type FlowEdge, type FlowNode, lineType} from './types';


export type RFState = {
    nodes: FlowNode[];
    edges: FlowEdge[];
    sidebarDragType: string;
    onNodesChange: OnNodesChange<FlowNode>;
    onEdgesChange: OnEdgesChange<FlowEdge>;
    initDiagram: (initData: string) => void;
    getData: () => {
        nodes: FlowNode[];
        edges: FlowEdge[];
    };
    updateNodeLabel: (nodeId: string, label: string) => void;
    updateEdgeLabel: (nodeId: string, label: string) => void;
    onSideBarDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void;
    addNode: (newNode: FlowNode) => void;
    setEdges: (callback: (edges: FlowEdge[]) => FlowEdge[]) => void;
    updateNodesInputStyles: (
        nodeIds: string[],
        styles?: {
            align?: 'center' | 'left' | 'right',
            verticalAlign?: 'center' | 'top' | 'bottom',
        }
    ) => void;
    updateLineType: (
        edgeIds: string[],
        type: lineType,
    ) => void;
};

const useStore = create<RFState>((set, get) => ({
    nodes: [
    ],
    edges: [
    ],
    sidebarDragType: '',
    onNodesChange: (changes: NodeChange<FlowNode>[]) => {
        set({
            nodes: applyNodeChanges<FlowNode>(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => {
        set({
            edges: applyEdgeChanges<FlowEdge>(changes, get().edges),
        });
    },
    /**
     * 初始化
     * */
    initDiagram: (initData: string) => {
        const data = JSON.parse(initData);
        set({
            ...data,
        })
    },
    /**
     * 获得图表数据
     * */
    getData: () => {
        return {
            nodes: get().nodes,
            edges: get().edges,
        }
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
     * 更新边的label
     * */
    updateEdgeLabel: (edgeId: string, label: string) => {
        set({
            edges: get().edges.map((edge) => {
                if (edge.id === edgeId) {
                    return {
                        ...edge,
                        data: { ...edge.data, label },
                    } as FlowEdge;
                }
                return edge;
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
    /**
     * 修改节点的文字的样式
     * */
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
    /**
     * 更新连线类型
     * */
    updateLineType: (
        edgeIds: string[],
        type: lineType,
    ) => {
        set({
            edges: get().edges.map((edge) => {
                if (edgeIds.includes(edge.id)) {
                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            type,
                        },
                    } as FlowEdge;
                }
                return edge;
            }),
        });
    }
}));

export default useStore;
