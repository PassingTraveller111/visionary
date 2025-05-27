'use client'
import { useCallback } from 'react';
import {
    ReactFlow,
    useReactFlow,
    Controls,
    addEdge,
    Connection,
    MiniMap,
} from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import useStore, { RFState } from './store';
import FlowNode from './Nodes/FlowNode';
import FlowEdge from './Edges/FlowEdge';
import { type FlowNode as FlowNodeType, type FlowEdge as FlowEdgeType } from './types';
import '@xyflow/react/dist/style.css';
import ConnectionLine from "@/components/Diagram/ConnectionLine";

const selector = (state: RFState) => ({
    nodes: state.nodes,
    edges: state.edges,
    sideBarDragNode: state.sidebarDragNode,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    addNode: state.addNode,
    setEdges: state.setEdges,
});

const nodeTypes = {
    flow: FlowNode,
};

const edgeTypes = {
    flow: FlowEdge,
};

const connectionLineStyle = { stroke: '#F6AD55', strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: 'flow' };

const Flow = () => {
    const { nodes, edges, onNodesChange, onEdgesChange, sideBarDragNode, addNode, setEdges } = useStore(
        useShallow(selector)
    );
    const { screenToFlowPosition } = useReactFlow();

    // 处理节点连线事件
    const onConnect = useCallback((params: FlowEdgeType | Connection) => {
        // 使用 addEdge 函数添加新的边
        console.log('addEdge', params);
        const newEdge = {
            ...params,
            data: {
                label: 'new edge'
            }
        } as FlowEdgeType;
        setEdges((eds) => addEdge(newEdge, eds));
    }, [setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);
    /*
    * 从侧边栏拖动图形到画布上并松开鼠标
    * */
    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            if (!sideBarDragNode) {
                return;
            }
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            const newNode: FlowNodeType = {
                ...sideBarDragNode,
                id: Math.random().toString(),
                position,
                type: 'flow',
            };
            addNode(newNode);
        },
        [addNode, screenToFlowPosition, sideBarDragNode],
    );



    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onConnect={onConnect}
            connectionLineComponent={ConnectionLine}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineStyle={connectionLineStyle} // 拉出来连接线的默认属性
            fitView
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="download-image"
        >
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable />
        </ReactFlow>
    );
}

export default Flow;
