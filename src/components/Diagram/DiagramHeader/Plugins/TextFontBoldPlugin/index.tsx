import { useCallback, useMemo, useState } from "react";
import { useOnSelectionChange } from "@xyflow/react";
import useStore from "@/components/Diagram/store";
import { PluginType } from "@/components/Diagram/DiagramHeader/Plugins/type";
import PluginButton from "@/components/Diagram/DiagramHeader/Plugins/PluginButton/PluginButton";
import { FlowEdge, FlowNode } from "@/components/Diagram/types";

const TextFontBoldPlugin: PluginType = () => {
    const [selection, setSelection] = useState<{ nodes: FlowNode[]; edges: FlowEdge[] }>({ nodes: [], edges: [] });
    const updateNodesInputStyles = useStore(state => state.updateNodesInputStyles);
    const nodes = useStore(state => state.nodes); // 获取最新节点数据

    // 监听选中节点/边变化
    const onSelectionChange = useCallback(({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
        setSelection({ nodes, edges });
    }, []);

    useOnSelectionChange({ onChange: onSelectionChange });

    // 计算当前是否加粗
    const curFontBold = useMemo(() => {
        if (selection.nodes.length === 0) return false;

        // 获取第一个选中节点是否加粗
        const selectedNode = nodes.find(node => node.id === selection.nodes[0].id);
        const firstFontBold = selectedNode?.data?.inputStyles?.bold;

        if (!firstFontBold) return false;


        // 检查所有选中节点的字号是否一致
        const isUniform = selection.nodes.every(selectedNode => {
            const node = nodes.find(node => node.id === selectedNode.id);
            const nodeBold = node?.data?.inputStyles?.bold;
            return nodeBold === firstFontBold;
        });

        return isUniform ? firstFontBold : false;
    }, [selection, nodes]);

    const isInputDisabled = selection.nodes.length === 0;

    // 处理加粗变化
    const handleFontFontChange = useCallback(() => {
        if (isInputDisabled) return;

        const nodeIds = selection.nodes.map(node => node.id);
        if (nodeIds.length > 0) {
            updateNodesInputStyles(nodeIds, { bold:  !curFontBold});
        }
    }, [curFontBold, isInputDisabled, selection.nodes, updateNodesInputStyles]);

    return (
        <PluginButton
            title="字号"
            iconName={'icon-bold'}
            disabled={isInputDisabled}
            selected={curFontBold}
            onClick={handleFontFontChange}
        />
    );
};

TextFontBoldPlugin.config = {
    name: "TextFontBoldPlugin",
    align: "left",
};

export default TextFontBoldPlugin;