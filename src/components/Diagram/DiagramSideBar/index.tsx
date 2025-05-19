'use client'
import styles from './index.module.scss';
import useStore, {RFState} from "@/components/Diagram/store";
import {useShallow} from "zustand/react/shallow";

const selector = (state: RFState) => ({
    onSideBarDragStart: state.onSideBarDragStart
});

const DiagramSideBar = () => {
    const { onSideBarDragStart } = useStore(
        useShallow(selector)
    );

    return <div
        className={styles.DiagramSideBarContainer}
    >
        <div
            className={styles.shapeBar}
            onDragStart={(event) => onSideBarDragStart(event, {
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
                },
                width: 100,
                height: 40,
            })}
            draggable>
            Input Node1
        </div>
    </div>
}

export default DiagramSideBar;