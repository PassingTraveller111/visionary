import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    GetBezierPathParams,
    getSmoothStepPath, GetSmoothStepPathParams,
    getStraightPath, GetStraightPathParams
} from '@xyflow/react';
import {type FlowEdge as FlowEdgeType} from "@/components/Diagram/types";
import useStore from "@/components/Diagram/store";
import EdgeInput from "@/components/Diagram/EdgeInput";
import styles from './index.module.scss'
import classNames from "classnames";



function FlowEdge({ id, data, markerEnd, selected, ...props }: EdgeProps<FlowEdgeType>) {
    const updateEdgeLabel = useStore((state) => state.updateEdgeLabel);
    const [edgePath, labelX, labelY] = getPath(props, data?.type);

    return <>
        <g>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    ...props.style,
                }}
                className={classNames({
                    [styles.animatedDash]: selected
                })}
                markerEnd={markerEnd}
            />
        </g>
        {
            (selected || data?.label) && <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        padding: 5,
                        borderRadius: 5,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <EdgeInput
                        value={data?.label ?? ''}
                        onChange={(value) => updateEdgeLabel(id, value)}
                        align={data?.inputStyles?.align}
                        verticalAlign={data?.inputStyles?.verticalAlign}
                        fontSize={data?.inputStyles?.fontSize}
                        bold={data?.inputStyles?.bold}
                        italic={data?.inputStyles?.italic}
                        underline={data?.inputStyles?.underline}
                        color={data?.inputStyles?.color}
                        lineHeight={data?.inputStyles?.lineHeight}
                        fill={data?.inputStyles?.fill}
                    />
                </div>
            </EdgeLabelRenderer>
        }
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
