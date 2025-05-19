import { type Edge, type Node} from '@xyflow/react';

export type FlowNodeDataType = {
    label: string;
    inputStyles: inputStylesType, // 输入框文字样式
};

export type FlowNode = Node<FlowNodeDataType, 'flow'>;

export type FlowEdgeData = {
    label: string;
    inputStyles: inputStylesType,
    type: lineType; // 连线类型
}

export type inputStylesType = {
    fontSize?: string, // 字体大小
    bold?: boolean, // 是否加粗
    italic?: boolean, // 是否斜体
    underline?: boolean, // 是否下划线
    color?: string, // 颜色
    lineHeight?: string, // 行高
    align?: 'center' | 'left' | 'right', // 横向对齐
    verticalAlign?: 'center' | 'top' | 'bottom', // 纵向对齐
} | undefined;

export type lineType = 'Bezier' | 'SmoothStep' | 'Straight';

export type FlowEdge = Edge<FlowEdgeData, 'flow'>;


