import { useCallback, useMemo, useState } from "react";
import { useOnSelectionChange } from "@xyflow/react";
import useStore from "@/components/Diagram/store";
import { PluginType } from "@/components/Diagram/DiagramHeader/Plugins/type";
import PluginButton from "@/components/Diagram/DiagramHeader/Plugins/PluginButton/PluginButton";
import { FlowEdge, FlowNode } from "@/components/Diagram/types";

const TextFontBoldPlugin: PluginType = () => {
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

    // 计算当前是否加粗
    const curFontBold = useMemo(() => {
        if (selection.nodes.length === 0 && selection.edges.length === 0) return false;

        // 获取第一个选中节点或者边是否加粗
        const selected = selection.nodes.length > 0 ?
            nodes.find(node => node.id === selection.nodes[0].id) :
            edges.find(edge => edge.id === selection.edges[0].id);

        const firstFontBold = selected?.data?.inputStyles?.bold;

        if (!firstFontBold) return false;


        // 检查所有选中节点的加粗是否一致
        const isUniformNode = selection.nodes.every(selectedNode => {
            const node = nodes.find(node => node.id === selectedNode.id);
            const nodeBold = node?.data?.inputStyles?.bold;
            return nodeBold === firstFontBold;
        });
        const isUniformEdge  = selection.edges.every(selectedEdge => {
            const edge = edges.find(edge => edge.id === selectedEdge.id);
            const edgeBold = edge?.data?.inputStyles?.bold;
            return edgeBold === firstFontBold;
        });

        return (isUniformNode && isUniformEdge) ? firstFontBold : false;
    }, [selection.nodes, selection.edges, nodes, edges]);

    const isInputDisabled = selection.nodes.length === 0 && selection.edges.length === 0;

    // 处理加粗变化
    const handleFontBoldChange = useCallback(() => {
        if (isInputDisabled) return;

        const nodeIds = selection.nodes.map(node => node.id);
        const edgeIds = selection.edges.map(edge => edge.id);
        if (nodeIds.length > 0) {
            updateNodesInputStyles(nodeIds, { bold: !curFontBold });
        }
        if (edgeIds.length > 0) {
            updateEdgesInputStyles(edgeIds, { bold: !curFontBold });
        }

    }, [curFontBold, isInputDisabled, selection.edges, selection.nodes, updateEdgesInputStyles, updateNodesInputStyles]);

    return (
        <PluginButton
            title="加粗"
            iconName={'icon-bold'}
            disabled={isInputDisabled}
            selected={curFontBold}
            onClick={handleFontBoldChange}
        />
    );
};

TextFontBoldPlugin.config = {
    name: "TextFontBoldPlugin",
    align: "left",
};

export default TextFontBoldPlugin;