import { useCallback, useMemo, useState } from "react";
import { useOnSelectionChange } from "@xyflow/react";
import useStore from "@/components/Diagram/store";
import { PluginType } from "@/components/Diagram/DiagramHeader/Plugins/type";
import PluginButton from "@/components/Diagram/DiagramHeader/Plugins/PluginButton/PluginButton";
import { FlowEdge, FlowNode } from "@/components/Diagram/types";

const TextUnderlinePlugin: PluginType = () => {
    const [selection, setSelection] = useState<{ nodes: FlowNode[]; edges: FlowEdge[] }>({ nodes: [], edges: [] });
    const updateNodesInputStyles = useStore(state => state.updateNodesInputStyles);
    const nodes = useStore(state => state.nodes); // 获取最新节点数据

    // 监听选中节点/边变化
    const onSelectionChange = useCallback(({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
        setSelection({ nodes, edges });
    }, []);

    useOnSelectionChange({ onChange: onSelectionChange });

    // 计算当前是否下划线
    const curUnderline = useMemo(() => {
        if (selection.nodes.length === 0) return false;

        // 获取第一个选中节点是否下划线
        const selectedNode = nodes.find(node => node.id === selection.nodes[0].id);
        const firstUnderline = selectedNode?.data?.inputStyles?.underline;

        if (!firstUnderline) return false;


        // 检查所有选中节点的下划线是否一致
        const isUniform = selection.nodes.every(selectedNode => {
            const node = nodes.find(node => node.id === selectedNode.id);
            const nodeUnderline = node?.data?.inputStyles?.underline;
            return nodeUnderline === firstUnderline;
        });

        return isUniform ? firstUnderline : false;
    }, [selection, nodes]);

    const isInputDisabled = selection.nodes.length === 0;

    const handleUnderlineChange = useCallback(() => {
        if (isInputDisabled) return;

        const nodeIds = selection.nodes.map(node => node.id);
        if (nodeIds.length > 0) {
            updateNodesInputStyles(nodeIds, { underline:  !curUnderline});
        }
    }, [curUnderline, isInputDisabled, selection.nodes, updateNodesInputStyles]);

    return (
        <PluginButton
            title="下划线"
            iconName={'icon-underline'}
            disabled={isInputDisabled}
            selected={curUnderline}
            onClick={handleUnderlineChange}
        />
    );
};

TextUnderlinePlugin.config = {
    name: "TextUnderlinePlugin",
    align: "left",
};

export default TextUnderlinePlugin;