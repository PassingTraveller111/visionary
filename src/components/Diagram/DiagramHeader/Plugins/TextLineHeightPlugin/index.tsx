import {useCallback, useState} from "react";
import { useOnSelectionChange} from "@xyflow/react";
import useStore from "@/components/Diagram/store";
import {PluginType} from "@/components/Diagram/DiagramHeader/Plugins/type";
import PluginButton from "@/components/Diagram/DiagramHeader/Plugins/PluginButton/PluginButton";
import {FlowEdge, FlowNode} from "@/components/Diagram/types";


const TextLineHeightPlugin: PluginType = () => {
    const [selection, setSelection] = useState<{ nodes: FlowNode[], edges: FlowEdge[] }>({ nodes: [], edges: [] });
    const updateNodesInputStyles = useStore(state => state.updateNodesInputStyles);
    const updateEdgesInputStyles = useStore(state => state.updateEdgeInputStyles);

    // 监听选中节点/边变化
    const onSelectionChange = useCallback(({ nodes, edges }: { nodes: FlowNode[], edges: FlowEdge[] }) => {
        setSelection({
            nodes,
            edges,
        })
    }, []);
    useOnSelectionChange({
        onChange: onSelectionChange,
    });

    const changeLineHeight = (
        lineHeight: number
    ) => {
        const nodeIds = selection.nodes.map((node) => node.id);
        const edgeIds = selection.edges.map((edge) => edge.id);
        if(lineHeight){
            updateNodesInputStyles(nodeIds, {
                lineHeight,
            });
            updateEdgesInputStyles(edgeIds, {
                lineHeight,
            })
        }

    }
    return <PluginButton
        title='行高'
        iconName='icon-lineHeight'
        disabled={!(selection.nodes.length > 0 || selection.edges.length > 0)}
        dropdownProps={{
            menu: {
                items: [
                    {
                        key: '1.0',
                        label: '1.0',
                        onClick: () => changeLineHeight(1),
                    },
                    {
                        key: '1.25',
                        label: '1.25',
                        onClick: () => changeLineHeight(1.25),
                    },
                    {
                        key: '1.5',
                        label: '1.5',
                        onClick: () => changeLineHeight(1.5),
                    },
                    {
                        key: '2.0',
                        label: '2.0',
                        onClick: () => changeLineHeight(2.0),
                    },
                    {
                        key: '2.5',
                        label: '2.5',
                        onClick: () => changeLineHeight(2.5),
                    },
                    {
                        key: '3',
                        label: '3',
                        onClick: () => changeLineHeight(3),
                    },
                ]
            }
        }}
    />
}

TextLineHeightPlugin.config = {
    name: 'TextLineHeightPlugin', // 标识插件
    align: 'left', // 位置
}


export default TextLineHeightPlugin;