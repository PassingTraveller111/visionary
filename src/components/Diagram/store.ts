import {
    applyEdgeChanges,
    applyNodeChanges,
    EdgeChange,
    NodeChange,
    OnEdgesChange,
    OnNodesChange,
} from '@xyflow/react';
import {create} from 'zustand';

import {type FlowEdge, type FlowNode, inputStylesType, lineType} from './types';


export type RFState = {
    nodes: FlowNode[];
    edges: FlowEdge[];
    sidebarDragNode: FlowNode;
    onNodesChange: OnNodesChange<FlowNode>;
    onEdgesChange: OnEdgesChange<FlowEdge>;
    initDiagram: (initData: string) => void;
    getData: () => {
        nodes: FlowNode[];
        edges: FlowEdge[];
    };
    updateNodeLabel: (nodeId: string, label: string) => void;
    updateEdgeLabel: (nodeId: string, label: string) => void;
    onSideBarDragStart: (event: React.DragEvent<HTMLDivElement>, node: FlowNode) => void;
    addNode: (newNode: FlowNode) => void;
    setEdges: (callback: (edges: FlowEdge[]) => FlowEdge[]) => void;
    updateNodesInputStyles: (
        nodeIds: string[],
        styles: inputStylesType,
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
    // 侧边栏拖动的节点数据
    sidebarDragNode: {
        id: 'new Node',
        position: {
            x: 0,
            y: 0,
        },
        data: {
            inputStyles: {
                align: 'center',
                verticalAlign: 'center',
                fontSize: '14px',
            },
            label: 'new Node',
        },
    },
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
    onSideBarDragStart: (event: React.DragEvent<HTMLDivElement>, node: FlowNode) => {
        set({
            sidebarDragNode: {
                ...get().sidebarDragNode,
                ...node
            },
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
        styles: inputStylesType,
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
                                ...styles,
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
