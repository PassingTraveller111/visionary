import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    GetBezierPathParams,
    getSmoothStepPath, GetSmoothStepPathParams,
    getStraightPath, GetStraightPathParams, useOnSelectionChange
} from '@xyflow/react';
import {type FlowEdge as FlowEdgeType, FlowNode} from "@/components/Diagram/types";
import useStore from "@/components/Diagram/store";
import {useCallback, useState} from "react";
import NodeInput from "@/components/Diagram/NodeInput";



function FlowEdge({ id, data, markerEnd, ...props }: EdgeProps<FlowEdgeType>) {
    const updateEdgeLabel = useStore((state) => state.updateEdgeLabel);
    const [edgePath, labelX, labelY] = getPath(props, data?.type);
    const [showInput, setShowInput] = useState(false);
    const [selection, setSelection] = useState<{ nodes: FlowNode[], edges: FlowEdgeType[] }>({ nodes: [], edges: [] });

    // 监听选中节点/边变化
    const onSelectionChange = useCallback(({ nodes, edges }: { nodes: FlowNode[], edges: FlowEdgeType[] }) => {
        setSelection({
            nodes,
            edges,
        })
    }, []);
    useOnSelectionChange({
        onChange: onSelectionChange,
    });
console.log(selection)
    return <>
        <g>
            <BaseEdge
                id={id}
                path={edgePath}
                style={props.style}
                markerEnd={markerEnd}
            />
        </g>
        <EdgeLabelRenderer>
            {
                showInput ? (
                            data?.label && <div
                            style={{
                                position: 'absolute',
                                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                                background: '#ffcc00',
                                padding: 5,
                                borderRadius: 5,
                                fontSize: 12,
                                fontWeight: 700,
                                pointerEvents: 'all',
                            }}
                            className="nodrag nopan"
                        >
                            {data?.label}
                        </div>
                ) : (
                    <NodeInput value={data?.label ?? ''} onChange={(value) => updateEdgeLabel(id, value)}/>
                )
            }


        </EdgeLabelRenderer>
    </>
}

const getPath = (params: GetBezierPathParams | GetStraightPathParams | GetSmoothStepPathParams, type?: 'Bezier' | 'SmoothStep' | 'Straight') => {
    switch (type) {
        case 'Bezier':
            return getBezierPath(params);
        case 'SmoothStep':
            return getSmoothStepPath(params);
        case 'Straight':
            return getStraightPath(params);
        default:
            return getSmoothStepPath(params);
    }
}

export default FlowEdge;
