'use client'
import { useCallback } from 'react';
import {
    ReactFlow,
    ConnectionLineType,
    useReactFlow,
    Controls,
    Panel,
} from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import useStore, { RFState } from './store';
import FlowNode from './Nodes/FlowNode';
import FlowEdge from './Edges/FlowEdge';
import { type FlowNode as FlowNodeType } from './types';
import '@xyflow/react/dist/style.css';

const selector = (state: RFState) => ({
    nodes: state.nodes,
    edges: state.edges,
    sidebarDragType: state.sidebarDragType,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    addNode: state.addNode,
});

const nodeTypes = {
    flow: FlowNode,
};

const edgeTypes = {
    flow: FlowEdge,
};

const connectionLineStyle = { stroke: '#F6AD55', strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: 'flow' };

function Flow() {
    const { nodes, edges, onNodesChange, onEdgesChange, sidebarDragType, addNode } = useStore(
        useShallow(selector)
    );
    const { screenToFlowPosition } = useReactFlow();


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
        </ReactFlow>
    );
}

export default Flow;
