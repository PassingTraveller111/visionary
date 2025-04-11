import { useLayoutEffect, useEffect, useRef } from 'react';
import {Handle, NodeProps, NodeResizer, Position} from '@xyflow/react';

import useStore from '../../store';

import { type FlowNode as FlowNodeType } from '../../types';

import styles from './index.module.scss';

const FlowNode = ({ id, data, selected }: NodeProps<FlowNodeType>) => {
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
            <NodeResizer
                color="#ff0071"
                isVisible={selected}
            />
            <div className={styles.NodeContainer}>
                <input
                    value={data.label}
                    onChange={(evt) => updateNodeLabel(id, evt.target.value)}
                    ref={inputRef}
                />
            </div>
            <Handle type="target" position={Position.Top} id='top-target' /> {/* 每个句柄需要一个id，用来唯一标识是该节点上的哪个句柄 */}
            <Handle type="source" position={Position.Top} id='top-source'/>
            <Handle type="target" position={Position.Right} id='right-target'/>
            <Handle type="source" position={Position.Right} id='right-source'/>
            <Handle type="target" position={Position.Bottom} id='bottom-target'/>
            <Handle type="source" position={Position.Bottom} id='bottom-source'/>
            <Handle type="target" position={Position.Left} id='left-target'/>
            <Handle type="source" position={Position.Left} id='left-source'/>
        </>
    );
}

export default FlowNode;
