import { useCallback, useMemo, useState } from "react";
import { useOnSelectionChange } from "@xyflow/react";
import useStore from "@/components/Diagram/store";
import { PluginType } from "@/components/Diagram/DiagramHeader/Plugins/type";
import PluginButton from "@/components/Diagram/DiagramHeader/Plugins/PluginButton/PluginButton";
import { FlowEdge, FlowNode } from "@/components/Diagram/types";
import {ColorPicker, ColorPickerProps, theme} from "antd";
import {green, presetPalettes, red, generate} from "@ant-design/colors";
import {IconFont} from "@/components/IconFont";

type Presets = Required<ColorPickerProps>['presets'][number];

function genPresets(presets = presetPalettes) {
    return Object.entries(presets).map<Presets>(([label, colors]) => ({ label, colors, key: label }));
}

const LineColorPlugin: PluginType = () => {
    const [selection, setSelection] = useState<{ nodes: FlowNode[]; edges: FlowEdge[] }>({ nodes: [], edges: [] });
    const updateLineStyle = useStore(state => state.updateLineStyle);
    const edges = useStore(state => state.edges); // 获取最新节点数据

    // 监听选中节点/边变化
    const onSelectionChange = useCallback(({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
        setSelection({ nodes, edges });
    }, []);

    useOnSelectionChange({ onChange: onSelectionChange });

    const curColor = useMemo(() => {
        if (selection.edges.length === 0) return null;
        // 获取第一个选中边是否有颜色
        const selectedEdge = edges.find(edge => edge.id === selection.edges[0].id);
        const firstColor = selectedEdge?.style?.stroke;
        if (!firstColor) return null;

        // 检查所有选中节点的字体颜色是否一致
        const isUniform = selection.edges.every(selectedEdge => {
            const edge = edges.find(edge => edge.id === selectedEdge.id);
            const edgeColor = edge?.style?.stroke;
            return edgeColor === firstColor;
        });

        return isUniform ? firstColor : null;
    }, [selection, edges]);
    const isInputDisabled = selection.edges.length === 0;

    // 处理字体颜色变化
    const handleColorChange = useCallback((color: string) => {
        if (isInputDisabled) return;

        const edgeIds = selection.edges.map(edge => edge.id);
        if (edgeIds.length > 0) {
            updateLineStyle(edgeIds, { stroke: color });
        }
    }, [isInputDisabled, selection.edges, updateLineStyle]);


    // 预设颜色相关
    const { token } = theme.useToken();
    const presets = genPresets({ primary: generate(token.colorPrimary), red, green });
    return (
        <PluginButton
            title="线条颜色"
            disabled={isInputDisabled}
            content={
                <ColorPicker
                    size={'small'}
                    disabled={isInputDisabled}
                    value={curColor}
                    presets={presets}
                    onChange={(color) => {
                        handleColorChange(color.toCssString())
                    }}
                >
                    <IconFont
                        type={'icon-lineColor'}
                        style={{
                            color: curColor ?? ''
                        }}
                    />
                </ColorPicker>
            }
        />
    );
};

LineColorPlugin.config = {
    name: "LineColorPlugin",
    align: "left",
};

export default LineColorPlugin;

