import React from "react";
import styles from "./index.module.scss";
import {Button} from "antd";

type CreatorSideBarLayoutProps = {
    children: React.ReactNode;
}
const CreatorSideBarLayout = (props: CreatorSideBarLayoutProps) => {
    const { children } = props;

    return <div className={styles.creatorSideBarLayout}>
        <div className={styles.sideBar}>
            <div className={styles.sideBarContent}>
                <Button
                    type="primary"
                    onClick={() => {
                        window.open('/editor/draft/new', '_blank');
                    }}
                >新建</Button>
            </div>
        </div>
        <div className={styles.content}>
            {children}
        </div>
    </div>
}

export default CreatorSideBarLayout;