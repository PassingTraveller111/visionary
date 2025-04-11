import { useLayoutEffect, useEffect, useRef } from 'react';
import { Handle, NodeProps, Position } from '@xyflow/react';

import useStore from '../../store';

import { type FlowNode as FlowNodeType } from '../../types';

import styles from './index.module.scss';

const FlowNode = ({ id, data }: NodeProps<FlowNodeType>) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const updateNodeLabel = useStore((state) => state.updateNodeLabel);

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus({ preventScroll: true });
        }, 1);
    }, []);

    useLayoutEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.width = `${data.label.length * 8}px`;
        }
    }, [data.label.length]);

    return (
        <>
            <div className={styles.NodeContainer}>
                <input
                    value={data.label}
                    onChange={(evt) => updateNodeLabel(id, evt.target.value)}
                    className="input nodrag"
                    ref={inputRef}
                />
            </div>

            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Top} />
            <Handle type="target" position={Position.Right} />
            <Handle type="source" position={Position.Right} />
            <Handle type="target" position={Position.Bottom} />
            <Handle type="source" position={Position.Bottom} />
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Left} />
        </>
    );
}

export default FlowNode;
