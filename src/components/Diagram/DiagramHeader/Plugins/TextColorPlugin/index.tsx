import { useCallback, useMemo, useState } from "react";
import { useOnSelectionChange } from "@xyflow/react";
import useStore from "@/components/Diagram/store";
import { PluginType } from "@/components/Diagram/DiagramHeader/Plugins/type";
import PluginButton from "@/components/Diagram/DiagramHeader/Plugins/PluginButton/PluginButton";
import { FlowEdge, FlowNode } from "@/components/Diagram/types";
import {ColorPicker, ColorPickerProps, theme} from "antd";
import {green, presetPalettes, red, generate} from "@ant-design/colors";

type Presets = Required<ColorPickerProps>['presets'][number];

function genPresets(presets = presetPalettes) {
    return Object.entries(presets).map<Presets>(([label, colors]) => ({ label, colors, key: label }));
}

const TextColorPlugin: PluginType = () => {
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

    const curColor = useMemo(() => {
        if (selection.nodes.length === 0 && selection.edges.length === 0) return null;

        // 获取第一个选中节点或者边是否有颜色
        const selected = selection.nodes.length > 0 ?
            nodes.find(node => node.id === selection.nodes[0].id) :
            edges.find(edge => edge.id === selection.edges[0].id);

        const firstColor = selected?.data?.inputStyles?.color;
        if (!firstColor) return null;

        // 检查所有选中节点以及边的字体颜色是否一致
        const isUniformNode = selection.nodes.every(selectedNode => {
            const node = nodes.find(node => node.id === selectedNode.id);
            const nodeColor = node?.data?.inputStyles?.color;
            return nodeColor === firstColor;
        });
        const isUniformEdge  = selection.edges.every(selectedEdge => {
            const edge = edges.find(edge => edge.id === selectedEdge.id);
            const edgeColor = edge?.data?.inputStyles?.color;
            return edgeColor === firstColor;
        });

        return (isUniformNode && isUniformEdge) ? firstColor : null;
    }, [selection.nodes, selection.edges, nodes, edges]);


    const isInputDisabled = selection.nodes.length === 0 && selection.edges.length === 0;

    // 处理字体颜色变化
    const handleColorChange = useCallback((color: string) => {
        if (isInputDisabled) return;

        const nodeIds = selection.nodes.map(node => node.id);
        const edgeIds = selection.edges.map(edge => edge.id);
        if (nodeIds.length > 0) {
            updateNodesInputStyles(nodeIds, { color });
        }
        if (edgeIds.length > 0) {
            updateEdgesInputStyles(edgeIds, { color });
        }
    }, [isInputDisabled, selection.edges, selection.nodes, updateEdgesInputStyles, updateNodesInputStyles]);


    // 预设颜色相关
    const { token } = theme.useToken();
    const presets = genPresets({ primary: generate(token.colorPrimary), red, green });
    return (
        <PluginButton
            title="字体颜色"
            content={
                <ColorPicker
                    size={'small'}
                    disabled={isInputDisabled}
                    value={curColor}
                    presets={presets}
                    onChange={(color) => {
                        handleColorChange(color.toCssString())
                    }}
                />
            }
        />
    );
};

TextColorPlugin.config = {
    name: "TextColorPlugin",
    align: "left",
};

export default TextColorPlugin;

