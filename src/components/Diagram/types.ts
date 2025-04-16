import { type Edge, type Node} from '@xyflow/react';

export type FlowNodeDataType = {
    label: string;
    inputStyles?: {
        align?: 'center' | 'left' | 'right',
        verticalAlign?: 'center' | 'top' | 'bottom',
    }
};

export type FlowNode = Node<FlowNodeDataType, 'flow'>;

export type FlowEdgeData = {
    label: string;
    inputStyles?: {
        align?: 'center' | 'left' | 'right',
        verticalAlign?: 'center' | 'top' | 'bottom',
    }
    type: lineType; // 连线类型
}

export type lineType = 'Bezier' | 'SmoothStep' | 'Straight';

export type FlowEdge = Edge<FlowEdgeData, 'flow'>;


