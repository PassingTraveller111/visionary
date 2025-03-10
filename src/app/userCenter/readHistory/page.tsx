"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import { useEffect } from "react";
import {Empty} from "antd";
import {useAppSelector} from "@/store";
import {useGetArticleReadingRecordsByUserId} from "@/hooks/article_reading_records/useArticleReadingRecords";
import moment from "moment";
import {IconFont} from "@/components/IconFont";



const ReadHistory = () => {
    const { historyList, getHistoryList, loadMore, contextHandle } = useGetArticleReadingRecordsByUserId();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    useEffect(() => {
        if(userInfo.id === 0) return;
        getHistoryList({
            userId: userInfo.id,
            isInit: true,
        });
    }, [getHistoryList, userInfo.id, userInfo.isLoading]);
    return <>
        <NavLayout>
            {contextHandle}
            <div
                className={styles['history-container']}
                onScroll={(e) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    const {scrollTop, clientHeight, scrollHeight} = e.target;
                    if (scrollTop + clientHeight >= scrollHeight) {
                        loadMore(userInfo.id);
                    }
                }}
            >
                <div className={styles['articleList-container']}>
                    <div className={styles.headerContainer}>
                        浏览记录
                    </div>
                    {historyList.length === 0 && <Empty/>}
                    {historyList.map((record) => {
                        return <div key={record.article_id} className={styles['articleList-item']}
                                    onClick={() => {
                                        window.open('/reader/' + record.article_id);
                                    }}
                        >
                            <div>
                                <div>
                                    <IconFont type={'icon-history'}/>：
                                    {moment(record.read_time).format('YYYY-MM-DD HH:mm')}
                                </div>
                                <div className={styles['article-title']}>{record.title}</div>
                                <div className={styles.summary}>{record.summary}</div>
                                <div className={styles.authorName}>{record.author_nickname}</div>
                            </div>
                        </div>
                    })}
                </div>
            </div>
        </NavLayout>
    </>
}

export default ReadHistory;