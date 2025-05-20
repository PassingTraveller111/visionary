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
    const nodes = useStore(state => state.nodes); // 获取最新节点数据

    // 监听选中节点/边变化
    const onSelectionChange = useCallback(({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
        setSelection({ nodes, edges });
    }, []);

    useOnSelectionChange({ onChange: onSelectionChange });

    // 计算当前字号
    const curFontSize = useMemo(() => {
        if (selection.nodes.length === 0) return null;

        // 获取第一个选中节点的字号
        const selectedNode = nodes.find(node => node.id === selection.nodes[0].id);
        const firstFontSize = selectedNode?.data?.inputStyles?.fontSize;

        if (!firstFontSize) return null;

        // 解析为数字
        const sizeNum = parseInt(firstFontSize, 10);
        if (isNaN(sizeNum)) return null;

        // 检查所有选中节点的字号是否一致
        const isUniform = selection.nodes.every(selectedNode => {
            const node = nodes.find(node => node.id === selectedNode.id);
            const nodeSize = node?.data?.inputStyles?.fontSize;
            return nodeSize === firstFontSize;
        });

        return isUniform ? sizeNum : null;
    }, [selection, nodes]);

    // 处理字号变化
    const handleFontSizeChange = useCallback((value?: number | null) => {
        if (value === undefined || value === null) return;

        const nodeIds = selection.nodes.map(node => node.id);
        if (nodeIds.length > 0) {
            updateNodesInputStyles(nodeIds, { fontSize: `${value}px` });
        }
    }, [selection, updateNodesInputStyles]);

    // 控制输入框状态
    const isInputDisabled = selection.nodes.length === 0;
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
                    style={{ width: 80 }}
                />
            }
            disabled={isInputDisabled}
        />
    );
};

TextFontSizePlugin.config = {
    name: "TextFontSizePlugin",
    align: "left",
};

export default TextFontSizePlugin;