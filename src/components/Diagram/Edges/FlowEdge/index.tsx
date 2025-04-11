import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';

function FlowEdge(props: EdgeProps) {
    const { sourceX, sourceY, targetX, targetY } = props;

    const [edgePath] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return <BaseEdge path={edgePath} style={props.style} />;
}

export default FlowEdge;
