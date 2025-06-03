'use client'
import styles from './index.module.scss';
import useStore, {RFState} from "@/components/Diagram/store";
import {useShallow} from "zustand/react/shallow";
import {Shapes, ShapeType} from "@/components/Diagram/Nodes/FlowNode/shapes";
import {FlowNode} from "@/components/Diagram/types";
import {Collapse, CollapseProps} from "antd";
import DragItem from "@/components/Diagram/DiagramSideBar/DragItem";


const selector = (state: RFState) => ({
    onSideBarDragStart: state.onSideBarDragStart
});

const createNode = (shape: string, width?: string | number, height?: string | number) => {
    return {
        id: '0',
        position: {
            x: 0,
            y: 0,
        },
        data: {
            label: 'input Node',
            inputStyles: {
                fontSize: '18px',
                align: 'center',
                verticalAlign: 'center',
                bold: true,
                underline: true,
                color: '#123',
            },
            shape: {
                d: shape,
                stroke: 'black',
                strokeWidth: 1,
            }
        },
        width: width ?? 120,
        height: height ?? 120,
    } as FlowNode;
}


const List: {
    key: string,
    label: string,
    items: ShapeType[]
}[] = [
    {
        key: 'base',
        label: '基础图形',
        items: Object.keys(Shapes.Base).map((key) => Shapes.Base[key]),
    },
    {
        key: 'flow',
        label: '流程图',
        items: Object.keys(Shapes.Flow).map((key) => Shapes.Flow[key]),
    }
]

const DiagramSideBar = () => {
    const { onSideBarDragStart } = useStore(
        useShallow(selector)
    );

    const items: CollapseProps['items'] = List.map(item => {
        return {
            key: item.key,
            label: item.label,
            children: <div
                className={styles.collapseItem}
            >
                {item.items.map((shape) => {
                    return <DragItem
                        key={shape.title}
                        title={shape.title}
                        flowNode={createNode(shape.d, shape.width, shape.height)}
                        onDragStart={(event) => onSideBarDragStart(event, createNode(shape.d, shape.width, shape.height))}
                    />
                })}
            </div>
        }
    })

    return <div
        className={styles.DiagramSideBarContainer}
    >
        <Collapse
            items={items}
        />
    </div>
}

export default DiagramSideBar;