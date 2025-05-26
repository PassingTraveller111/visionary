import React from 'react';
import {
    ConnectionLineComponentProps,
    getBezierPath,
    GetBezierPathParams,
    getSmoothStepPath,
    GetSmoothStepPathParams, getStraightPath,
    GetStraightPathParams,
} from '@xyflow/react';



const ConnectionLine =  ({ fromX, fromY, toX, toY, fromPosition, toPosition, connectionLineStyle } : ConnectionLineComponentProps) => {
    const path = getPath({
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: toX,
        targetY: toY,
        targetPosition: toPosition,
    }, 'SmoothStep');
    return (
        <g>
            <path
                fill="none"
                stroke={connectionLineStyle?.stroke ?? 'red'}
                strokeWidth={connectionLineStyle?.strokeWidth ?? 1.5}
                d={path[0]}
            />
            <circle
                cx={toX}
                cy={toY}
                fill="#fff"
                r={3}
                stroke='red'
                strokeWidth={1.5}
            />
        </g>
    );
};

export default ConnectionLine;

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