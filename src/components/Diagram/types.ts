import { type Node } from '@xyflow/react';

export type FlowNodeDataType = {
    label: string;
    inputStyles?: {
        align?: 'center' | 'left' | 'right',
        verticalAlign?: 'center' | 'top' | 'bottom',
    }
};

export type FlowNode = Node<FlowNodeDataType, 'flow'>;


