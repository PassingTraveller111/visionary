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
    const nodes = useStore(state => state.nodes); // 获取最新节点数据

    // 监听选中节点/边变化
    const onSelectionChange = useCallback(({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
        setSelection({ nodes, edges });
    }, []);

    useOnSelectionChange({ onChange: onSelectionChange });

    const curColor = useMemo(() => {
        if (selection.nodes.length === 0) return null;
        // 获取第一个选中节点是否有颜色
        const selectedNode = nodes.find(node => node.id === selection.nodes[0].id);
        const firstColor = selectedNode?.data?.inputStyles?.color;
        if (!firstColor) return null;

        // 检查所有选中节点的字体颜色是否一致
        const isUniform = selection.nodes.every(selectedNode => {
            const node = nodes.find(node => node.id === selectedNode.id);
            const nodeColor = node?.data?.inputStyles?.color;
            return nodeColor === firstColor;
        });

        return isUniform ? firstColor : null;
    }, [selection, nodes]);
    const isInputDisabled = selection.nodes.length === 0;

    // 处理字体颜色变化
    const handleColorChange = useCallback((color: string) => {
        if (isInputDisabled) return;

        const nodeIds = selection.nodes.map(node => node.id);
        if (nodeIds.length > 0) {
            updateNodesInputStyles(nodeIds, { color });
        }
    }, [isInputDisabled, selection.nodes, updateNodesInputStyles]);


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

