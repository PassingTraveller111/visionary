import {FlowNode} from "@/components/Diagram/types";
import {DragEventHandler} from "react";
import styles from './index.module.scss';
import {Popover} from "antd";

type DragItemProps = {
    flowNode: FlowNode,
    onDragStart?: DragEventHandler<HTMLDivElement> | undefined,
    title?: string,
}


const DragItem = ({ flowNode, onDragStart, title }: DragItemProps) => {
    const { data, width = 1, height = 1 } = flowNode;
    const aspectRatio = width / height;
    return <Popover
        content={
            <>
                <div
                    className={styles.DiagramItemContainer}
                >
                    <svg
                        viewBox="-5 -5 110 110"
                        width={aspectRatio >= 1 ? '100%' : `calc(100% * ${aspectRatio})`}
                        height={aspectRatio <= 1 ? '100%' : `calc(100% / ${aspectRatio})`}
                        fill={data?.inputStyles?.fill ?? 'transparent'}
                        preserveAspectRatio="none" // 允许图形形变
                        shape-rendering="crispEdges" // 调整线条位置，与像素对齐，防止模糊
                    >
                        <path
                            vector-effect="non-scaling-stroke" // 让线条宽度不受拉伸影响
                            d={data?.shape?.d ?? ''}
                            stroke={data?.shape?.stroke}
                            strokeWidth={data?.shape?.strokeWidth}
                        />
                    </svg>
                </div>
                <div
                    className={styles.DiagramItemTitle}
                >
                    {title}
                </div>
            </>
        }
    >
        <div
            draggable
            onDragStart={onDragStart}
            className={styles.DiagramItemContainer}
        >
            <svg
                viewBox="-5 -5 110 110"
                width={aspectRatio >= 1 ? '100%' : `calc(100% * ${aspectRatio})`}
                height={aspectRatio <= 1 ? '100%' : `calc(100% / ${aspectRatio})`}
                fill={data?.inputStyles?.fill ?? 'transparent'}
                preserveAspectRatio="none" // 允许图形形变
                shape-rendering="crispEdges" // 调整线条位置，与像素对齐，防止模糊
            >
                <path
                    vector-effect="non-scaling-stroke" // 让线条宽度不受拉伸影响
                    d={data?.shape?.d ?? ''}
                    stroke={data?.shape?.stroke}
                    strokeWidth={data?.shape?.strokeWidth}
                />
            </svg>
        </div>
    </Popover>

}


export default DragItem;