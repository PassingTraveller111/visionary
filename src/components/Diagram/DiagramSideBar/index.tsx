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
        <div className={styles.shapeBar} onDragStart={(event) => onSideBarDragStart(event, 'input')} draggable>
            Input Node
        </div>
        <div className={styles.shapeBar} onDragStart={(event) => onSideBarDragStart(event, 'default')} draggable>
            Default Node
        </div>
        <div className={styles.shapeBar} onDragStart={(event) => onSideBarDragStart(event, 'output')} draggable>
            Output Node
        </div>
    </div>
}

export default DiagramSideBar;