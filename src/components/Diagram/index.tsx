'use client'
import { useCallback } from 'react';
import {
    ReactFlow,
    ConnectionLineType,
    useReactFlow,
    Controls,
    Panel, addEdge, Connection, MiniMap,
} from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import useStore, { RFState } from './store';
import FlowNode from './Nodes/FlowNode';
import FlowEdge from './Edges/FlowEdge';
import { type FlowNode as FlowNodeType, type FlowEdge as FlowEdgeType } from './types';
import '@xyflow/react/dist/style.css';

const selector = (state: RFState) => ({
    nodes: state.nodes,
    edges: state.edges,
    sidebarDragType: state.sidebarDragType,
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

const connectionLineStyle = { stroke: '#F6AD55', strokeWidth: 3, type: 'flow' };
const defaultEdgeOptions = { style: connectionLineStyle, type: 'flow' };

function Flow() {
    const { nodes, edges, onNodesChange, onEdgesChange, sidebarDragType, addNode, setEdges } = useStore(
        useShallow(selector)
    );
    const { screenToFlowPosition } = useReactFlow();

    // 处理节点连线事件
    const onConnect = useCallback((params: FlowEdgeType | Connection) => {
        // 使用 addEdge 函数添加新的边
        setEdges((eds) => addEdge(params, eds));
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
            if (!sidebarDragType) {
                return;
            }
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            const newNode: FlowNodeType = {
                id: Math.random().toString(),
                position,
                type: 'flow',
                data: { label: `${sidebarDragType} node` },
            };
            addNode(newNode);
        },
        [addNode, screenToFlowPosition, sidebarDragType],
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
            connectionLineType={ConnectionLineType.Straight}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineStyle={connectionLineStyle}
            fitView
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
            <Controls showInteractive={false} />
            <Panel position="top-left" className="header">
                React Flow Mind Map
            </Panel>
            <MiniMap pannable zoomable />
        </ReactFlow>
    );
}

export default Flow;
