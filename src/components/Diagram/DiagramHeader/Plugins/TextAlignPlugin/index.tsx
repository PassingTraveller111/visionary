import {useCallback, useState} from "react";
import {Edge, Node, useOnSelectionChange} from "@xyflow/react";
import useStore from "@/components/Diagram/store";
import {IconFont} from "@/components/IconFont";
import {PluginType} from "@/components/Diagram/DiagramHeader/Plugins/type";
import PluginButton from "@/components/Diagram/DiagramHeader/Plugins/PluginButton/PluginButton";


const TextAlignPlugin: PluginType = () => {
    const [selection, setSelection] = useState<{ nodes: Node[], edges: Edge[] }>({ nodes: [], edges: [] });
    const updateNodesInputStyles = useStore(state => state.updateNodesInputStyles);
    // 监听选中节点/边变化
    const onSelectionChange = useCallback(({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => {
        setSelection({
            nodes,
            edges,
        })
    }, []);
    useOnSelectionChange({
        onChange: onSelectionChange,
    });
    const changeAlign = (inputStyles: {
        align?: 'center' | 'left' | 'right',
        verticalAlign?: 'top' | 'bottom' | 'center'
    }) => {
        const nodeIds = selection.nodes.map((node) => node.id);
        updateNodesInputStyles(nodeIds, {
            align: inputStyles.align,
            verticalAlign: inputStyles.verticalAlign,
        });
    }
    return <PluginButton
        title='居中'
        iconName='icon-centerAlign'
        disabled={!(selection.nodes.length > 0 || selection.edges.length > 0)}
        dropdownProps={{
            menu: {
                items: [
                {
                    key: 'center',
                    icon: <IconFont type='icon-centerAlign' />,
                    label: '水平居中',
                    onClick: () => changeAlign({
                    align: 'center'
                }),
                },
                {
                    key: 'left',
                    icon: <IconFont type='icon-leftAlign' />,
                    label: '左对齐',
                    onClick: () => changeAlign({
                    align: 'left'
                }),
                },
                {
                    key: 'right',
                    icon: <IconFont type='icon-rightAlign' />,
                    label: '右对齐',
                    onClick: () => changeAlign({
                    align: 'right'
                }),
                },
                {
                    key: 'top',
                    icon: <IconFont type='icon-rightAlign' />,
                    label: '顶端对齐',
                    onClick: () => changeAlign({
                    verticalAlign: 'top'
                }),
                },
                {
                    key: 'middle',
                    icon: <IconFont type='icon-rightAlign' />,
                    label: '垂直居中对齐',
                    onClick: () => changeAlign({
                    verticalAlign: 'center'
                }),
                },
                {
                    key: 'bottom',
                    icon: <IconFont type='icon-rightAlign' />,
                    label: '底端对齐',
                    onClick: () => changeAlign({
                    verticalAlign: 'bottom'
                }),
                }
                ]
            }
        }}
    />
}

TextAlignPlugin.config = {
    name: 'TextAlignPlugin', // 标识插件
    align: 'left', // 位置
}


export default TextAlignPlugin;