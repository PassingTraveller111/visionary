import {ComponentType} from "@/components/ReactMarkdown/components/type";
import { Image } from "antd";
import styles from './index.module.scss';

const ImageComponents: ComponentType  = ({ node }) => {
    return <span className={styles.imgContainer}>
        <Image alt={''} {...node?.properties} />;
    </span>
}

export default ImageComponents;