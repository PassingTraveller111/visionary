import { useCallback, useMemo, useState } from "react";
import { useOnSelectionChange } from "@xyflow/react";
import useStore from "@/components/Diagram/store";
import { PluginType } from "@/components/Diagram/DiagramHeader/Plugins/type";
import PluginButton from "@/components/Diagram/DiagramHeader/Plugins/PluginButton/PluginButton";
import { InputNumber } from "antd";
import { FlowEdge, FlowNode } from "@/components/Diagram/types";

const TextFontSizePlugin: PluginType = () => {
    const [selection, setSelection] = useState<{ nodes: FlowNode[]; edges: FlowEdge[] }>({ nodes: [], edges: [] });
    const updateNodesInputStyles = useStore(state => state.updateNodesInputStyles);
    const updateEdgesInputStyles = useStore(state => state.updateEdgeInputStyles);

    const nodes = useStore(state => state.nodes); // 获取最新节点数据
    const edges = useStore(state => state.edges); // 获取最新边数据

    // 监听选中节点/边变化
    const onSelectionChange = useCallback(({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
        setSelection({ nodes, edges });
    }, []);

    useOnSelectionChange({ onChange: onSelectionChange });

    // 计算当前字号
    const curFontSize = useMemo(() => {
        if (selection.nodes.length === 0 && selection.edges.length === 0) return null;

        // 获取第一个选中节点或者边是否有颜色
        const selected = selection.nodes.length > 0 ?
            nodes.find(node => node.id === selection.nodes[0].id) :
            edges.find(edge => edge.id === selection.edges[0].id);

        const firstFontSize = selected?.data?.inputStyles?.fontSize;

        if (!firstFontSize) return null;

        // 解析为数字
        const sizeNum = parseInt(firstFontSize, 10);
        if (isNaN(sizeNum)) return null;

        // 检查所有选中节点的字号是否一致
        const isUniformNode = selection.nodes.every(selectedNode => {
            const node = nodes.find(node => node.id === selectedNode.id);
            const nodeSize = node?.data?.inputStyles?.fontSize;
            return nodeSize === firstFontSize;
        });
        const isUniformEdge = selection.edges.every(selectedEdge => {
            const edge = edges.find(edge => edge.id === selectedEdge.id);
            const edgeSize = edge?.data?.inputStyles?.fontSize;
            return edgeSize === firstFontSize;
        });

        return (isUniformEdge && isUniformNode) ? sizeNum : null;
    }, [selection.nodes, selection.edges, nodes, edges]);

    // 处理字号变化
    const handleFontSizeChange = useCallback((value?: number | null) => {
        if (value === undefined || value === null) return;

        const nodeIds = selection.nodes.map(node => node.id);
        const edgeIds = selection.edges.map(edge => edge.id);

        if (nodeIds.length > 0) {
            updateNodesInputStyles(nodeIds, { fontSize: `${value}px` });
        }
        if (edgeIds.length > 0) {
            updateEdgesInputStyles(edgeIds, { fontSize: `${value}px` });
        }
    }, [selection.edges, selection.nodes, updateEdgesInputStyles, updateNodesInputStyles]);

    // 控制输入框状态
    const isInputDisabled = selection.nodes.length === 0 && selection.edges.length === 0;
    const inputValue = curFontSize !== null ? curFontSize : undefined;
    return (
        <PluginButton
            title="字号"
            content={
                <InputNumber
                    disabled={isInputDisabled}
                    value={inputValue}
                    onChange={handleFontSizeChange}
                    min={8}
                    max={72}
                    step={1}
                    style={{ width: 90 }}
                    suffix={'px'}
                />
            }
            needHoverBg={false}
            disabled={isInputDisabled}
        />
    );
};

TextFontSizePlugin.config = {
    name: "TextFontSizePlugin",
    align: "left",
};

export default TextFontSizePlugin;