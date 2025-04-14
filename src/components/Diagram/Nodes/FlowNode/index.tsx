
import {
    Handle,
    NodeProps,
    NodeResizer,
    Position,
} from '@xyflow/react';
import useStore from '../../store';
import { type FlowNode as FlowNodeType } from '../../types';
import styles from './index.module.scss';
import classNames from "classnames";
import NodeInput from "@/components/Diagram/NodeInput";

const FlowNode = ({ id, data, selected }: NodeProps<FlowNodeType>) => {
    const updateNodeLabel = useStore((state) => state.updateNodeLabel);
    return (
        <>
            <NodeResizer
                color="#ff0071"
                isVisible={selected}
                minHeight={30}
                minWidth={30}
            />
            <div
                className={classNames({
                    [styles.NodeContainer]: true,
                })}
            >
                <NodeInput value={data.label} onChange={(value) => updateNodeLabel(id, value)} />
                <Handle type="target" position={Position.Top}
                        id='top-target'/> {/* 每个句柄需要一个id，用来唯一标识是该节点上的哪个句柄 */}
                <Handle type="source" position={Position.Top} id='top-source'/>
                <Handle type="target" position={Position.Right} id='right-target'/>
                <Handle type="source" position={Position.Right} id='right-source'/>
                <Handle type="target" position={Position.Bottom} id='bottom-target'/>
                <Handle type="source" position={Position.Bottom} id='bottom-source'/>
                <Handle type="target" position={Position.Left} id='left-target'/>
                <Handle type="source" position={Position.Left} id='left-source'/>
            </div>
        </>
    );
}

export default FlowNode;