import {
    applyEdgeChanges,
    applyNodeChanges,
    EdgeChange,
    NodeChange,
    OnEdgesChange,
    OnNodesChange,
} from '@xyflow/react';
import {create} from 'zustand';

import {type FlowEdge, type FlowNode, inputStylesType, lineStylesType, lineType} from './types';


export type RFState = {
    nodes: FlowNode[]; // 节点数据
    edges: FlowEdge[]; // 边数据
    sidebarDragNode: FlowNode; // 侧边栏当前拖动的节点
    onNodesChange: OnNodesChange<FlowNode>; // 节点修改触发
    onEdgesChange: OnEdgesChange<FlowEdge>; // 边修改触发
    initDiagram: (initData: string) => void; // 初始化
    getData: () => {
        nodes: FlowNode[];
        edges: FlowEdge[];
    }; // 获取节点和边数据
    updateNodeLabel: (nodeId: string, label: string) => void; // 更新节点的label
    updateEdgeLabel: (nodeId: string, label: string) => void; // 更新边的label
    onSideBarDragStart: (event: React.DragEvent<HTMLDivElement>, node: FlowNode) => void; // 开始从侧边栏拖拽节点
    addNode: (newNode: FlowNode) => void; // 添加节点
    setEdges: (callback: (edges: FlowEdge[]) => FlowEdge[]) => void; // 修改边
    updateNodesInputStyles: ( // 更新节点输入框样式
        nodeIds: string[],
        styles: inputStylesType,
    ) => void;
    updateEdgeInputStyles: (
        edgeIds: string[],
        styles: inputStylesType,
    ) => void;
    updateLineType: (  // 更新连线类型
        edgeIds: string[],
        type: lineType,
    ) => void;
    updateLineStyle: (
        edgeIds: string[],
        lineStyles: lineStylesType,
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
            shape: {
                d: '',
                stroke: 'black',
                strokeWidth: 1,
            }
        },
    },
    connectionLineStyle: {

    },
    defaultEdgeOptions: {

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
    updateEdgeInputStyles: (
        edgeIds: string[],
        styles: inputStylesType,
    ) => {
        set({
            edges: get().edges.map((edge) => {
                if (edgeIds.includes(edge.id)) {
                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            inputStyles: {
                                ...edge?.data?.inputStyles,
                                ...styles,
                            }
                        },
                    } as FlowEdge;
                }
                return edge;
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
    },
    updateLineStyle: (
        edgeIds,
        lineStyles
    ) => {
        set({
            edges: get().edges.map(edge => {
                if (edgeIds.includes(edge.id)) {
                    return {
                        ...edge,
                        style: {
                            ...edge.style,
                            ...lineStyles,
                        }
                    } as FlowEdge;
                }
                return edge;
            }),
        });
    }
}));

export default useStore;
