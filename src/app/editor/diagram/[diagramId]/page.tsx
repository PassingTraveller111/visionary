import Diagram from "@/components/Diagram";
import styles from './index.module.scss';
import DiagramHeader from "../../../../components/Diagram/DiagramHeader";
import DiagramToolBar from "../../../../components/Diagram/DiagramSideBar";

const DiagramPage = () => {
    return <div className={styles.DiagramContainer}>
        <div className={styles.Header}>
            <DiagramHeader/>
        </div>
        <div className={styles.Diagram}>
            <DiagramToolBar/>
            <div className={styles.center}>
                <Diagram/>
            </div>
            <div className={styles.right}>

            </div>
        </div>
    </div>
}


export default DiagramPage;