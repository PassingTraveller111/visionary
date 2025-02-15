import React from 'react'
import { useAppSelector } from "@/store";
import styles from "./index.module.scss";
import {useRouter} from "next/navigation";
import moment from "moment";


const ReaderHeader= () => {
    const { title, articleId, authorName, publishTime, views, authorId } = useAppSelector(state => state.rootReducer.articleReducer.value);
    const router = useRouter();
    const gotoEditor = () => {
        router.push(`/editor/${articleId}`);
    }
    const gotoProfile = () => {
        router.push(`/profile/${authorId}`);
    }
    return <div
        className={styles.readerHeaderContainer}
    >
        <div>
            <span className={styles.title}>{title}</span>
        </div>
        <div className={styles.introContainer}>
            <span className={styles.left}>
                <span className={styles.authorName} onClick={gotoProfile}>{authorName}</span>
                <span className={styles.publishTime}>{moment(publishTime).format('YYYY-MM-DD')}</span>
                <span className={styles.view}>{views}</span>
            </span>
            <span className={styles.right} onClick={gotoEditor}>
                编辑
            </span>
        </div>
    </div>
}

export default ReaderHeader;