import { useCallback, useMemo, useState } from "react";
import { useOnSelectionChange } from "@xyflow/react";
import useStore from "@/components/Diagram/store";
import { PluginType } from "@/components/Diagram/DiagramHeader/Plugins/type";
import PluginButton from "@/components/Diagram/DiagramHeader/Plugins/PluginButton/PluginButton";
import { FlowEdge, FlowNode } from "@/components/Diagram/types";
import {InputNumber} from "antd";



const LineWidthPlugin: PluginType = () => {
    const [selection, setSelection] = useState<{ nodes: FlowNode[]; edges: FlowEdge[] }>({ nodes: [], edges: [] });
    const updateLineStyle = useStore(state => state.updateLineStyle);
    const edges = useStore(state => state.edges); // 获取最新节点数据

    // 监听选中节点/边变化
    const onSelectionChange = useCallback(({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
        setSelection({ nodes, edges });
    }, []);

    useOnSelectionChange({ onChange: onSelectionChange });

    const curWidth = useMemo(() => {
        if (selection.edges.length === 0) return null;

        const selectedEdge = edges.find(edge => edge.id === selection.edges[0].id);
        const firstWidth = selectedEdge?.style?.strokeWidth;
        if (!firstWidth) return null;

        // 检查所有选中节点的字体颜色是否一致
        const isUniform = selection.edges.every(selectedEdge => {
            const edge = edges.find(edge => edge.id === selectedEdge.id);
            const edgeWidth = edge?.style?.strokeWidth;
            return edgeWidth === firstWidth;
        });

        return isUniform ? firstWidth : null;
    }, [selection, edges]) as number | null | undefined;

    const isInputDisabled = selection.edges.length === 0;

    const handleWidthChange = useCallback((width: number | null | undefined) => {
        if (isInputDisabled || !width) return;

        const edgeIds = selection.edges.map(edge => edge.id);
        if (edgeIds.length > 0) {
            updateLineStyle(edgeIds, { strokeWidth: width });
        }
    }, [isInputDisabled, selection.edges, updateLineStyle]);

    return (
        <PluginButton
            title="线条宽度"
            content={
                <InputNumber
                    disabled={isInputDisabled}
                    value={curWidth}
                    onChange={handleWidthChange}
                    min={0.5}
                    max={10}
                    step={0.5}
                    style={{ width: 95 }}
                    suffix={'px'}
                />
            }
            needHoverBg={false}
            disabled={isInputDisabled}
        />
    );
};

LineWidthPlugin.config = {
    name: "LineWidthPlugin",
    align: "left",
};

export default LineWidthPlugin;

