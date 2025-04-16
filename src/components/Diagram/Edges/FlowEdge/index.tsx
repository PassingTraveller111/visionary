import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    GetBezierPathParams,
    getSmoothStepPath, GetSmoothStepPathParams,
    getStraightPath, GetStraightPathParams
} from '@xyflow/react';
import { type FlowEdge as FlowEdgeType} from "@/components/Diagram/types";
import classNames from "classnames";
import styles from "@/components/Diagram/NodeInput/index.module.scss";
import useStore from "@/components/Diagram/store";
import {useState} from "react";


function FlowEdge({ id, data, markerEnd, ...props }: EdgeProps<FlowEdgeType>) {
    const updateEdgeLabel = useStore((state) => state.updateEdgeLabel);
    const [edgePath, labelX, labelY] = getPath(props, data?.type);
    const [showInput, setShowInput] = useState(false);
    return <>
        <g>
            <BaseEdge id={id} path={edgePath} style={props.style} markerEnd={markerEnd} />
        </g>
        <EdgeLabelRenderer>
            <div
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
                {
                    showInput ?
                        <textarea
                            rows={1}
                            value={data?.label}
                            onChange={(e) => {
                                updateEdgeLabel(id, e.target.value);
                            }}
                        />
                        :
                        data?.label
                }
            </div>
        </EdgeLabelRenderer>
    </>
}

const getPath = (params: GetBezierPathParams | GetStraightPathParams | GetSmoothStepPathParams, type?: 'Bezier' | 'SmoothStep' | 'Straight') => {
    switch (type) {
        case 'Bezier': return getBezierPath(params);
        case 'SmoothStep': return getSmoothStepPath(params);
        case 'Straight': return getStraightPath(params);
        default: return getSmoothStepPath(params);
    }
}

export default FlowEdge;
