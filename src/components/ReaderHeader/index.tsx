import React from 'react'
import styles from "./index.module.scss";
import {useRouter} from "next/navigation";
import moment from "moment";
import {useIsUserOwn} from "@/hooks/users/useUsers";


export type ReaderHeaderProps = {
    title: string;
    authorName?: string;
    publishTime?: string;
    views?: number;
    authorId: number;
    draft_id?: number;
}

const ReaderHeader= (props: ReaderHeaderProps) => {
    const { title, authorName, publishTime, views, authorId, draft_id } = props;
    const isUserOwn = useIsUserOwn();
    const isOwn = isUserOwn(authorId);
    const router = useRouter();
    const gotoEditor = () => {
        window.open(`/editor/draft/${draft_id}`, '_blank');
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
            {isOwn && <span className={styles.right} onClick={gotoEditor}>
                编辑
            </span>}
        </div>
    </div>
}

export default ReaderHeader;