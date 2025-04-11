import { type Node } from '@xyflow/react';

export type FlowNodeDataType = {
    label: string;
};

export type FlowNode = Node<FlowNodeDataType, 'flow'>;


