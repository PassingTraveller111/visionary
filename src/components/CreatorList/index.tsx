import styles from './index.module.scss';
import classNames from "classnames";


export type CreatorListProps = {
    NavLeftContent?: React.ReactNode;
    NavRightContent?: React.ReactNode;
    TabsContent?: React.ReactNode;
    ListContent?: React.ReactNode;
}


const CreatorList = (props: CreatorListProps) => {
    const { NavLeftContent, NavRightContent, ListContent, TabsContent } = props;
    return <div className={styles.CreatorListContainer}>
        <div className={styles.content}>
            {(NavLeftContent || NavRightContent) && <div className={styles.nav}>
                    <div
                        className={classNames({
                            [styles.navLeft]: true,
                            [styles.navTitle]: typeof NavLeftContent === 'string'
                        })}
                    >
                        {NavLeftContent}
                    </div>
                    <div className={styles.navRight}>
                        {NavRightContent}
                    </div>
                </div>
            }
            <div className={styles.tabs}>
                {TabsContent}
            </div>
            <div className={styles.List}>
                {ListContent}
            </div>
        </div>
    </div>
}

export default CreatorList;