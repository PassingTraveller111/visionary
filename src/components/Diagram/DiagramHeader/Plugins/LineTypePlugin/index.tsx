import {PluginType} from "@/components/Diagram/DiagramHeader/Plugins/type";
import PluginButton from "@/components/Diagram/DiagramHeader/Plugins/PluginButton/PluginButton";
import {IconFont} from "@/components/IconFont";
import {useCallback, useState} from "react";
import {Edge, Node, useOnSelectionChange} from "@xyflow/react";
import useStore from "@/components/Diagram/store";
import {lineType} from "@/components/Diagram/types";


const LineTypePlugin: PluginType = () => {
    const updateLineType = useStore(state => state.updateLineType);
    const [selection, setSelection] = useState<{ nodes: Node[], edges: Edge[] }>({ nodes: [], edges: [] });
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
    const onUpdateLineType = (type: lineType) => {
        const edgeIds = selection.edges.map(edge => edge.id);
        updateLineType(edgeIds, type);
    }
    return <PluginButton
        title={'线条类型'}
        iconName={'icon-straight'}
        disabled={!(selection.edges.length > 0)}
        dropdownProps={{
            menu: {
                items: [
                    {
                        key: 'Bezier',
                        label: '连接线圆角',
                        icon: <IconFont type='icon-bezier'/>,
                        onClick: () => onUpdateLineType('Bezier'),
                    },
                    {
                        key: 'SmoothStep',
                        label: '连接线直角',
                        icon: <IconFont type='icon-step'/>,
                        onClick: () => onUpdateLineType('SmoothStep'),
                    },
                    {
                        key: 'Straight',
                        label: '直连接线',
                        icon: <IconFont type='icon-straight'/>,
                        onClick: () => onUpdateLineType('Straight'),
                    },
                ]
            }
        }}
    />
}


LineTypePlugin.config = {
    name: 'LineTypePlugin',
    align: 'left',
}

export default LineTypePlugin;