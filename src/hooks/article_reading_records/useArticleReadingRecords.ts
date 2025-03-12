import {apiClient, apiList} from "@/clientApi";
import {
    insertArticleReadingRecordRequestType, insertArticleReadingRecordResponseType
} from "@/app/api/protected/article_reading_records/insertArticleReadingRecord/route";
import {useCallback, useState} from "react";
import {
    getArticleReadingRecordsByUserIdRequestType, getArticleReadingRecordsByUserIdResponseType
} from "@/app/api/protected/article_reading_records/getArticleReadingRecordsByUserId/route";
import {article_reading_recordsTableType} from "@/app/api/sql/type";
import {articleTableType} from "@/app/api/protected/article/type";
import useMessage from "antd/es/message/useMessage";
import {
    getLookCountsByUserIdRequestType, getLookCountsByUserIdResponseType
} from "@/app/api/protected/article_reading_records/getLookCountsByUserId/route";


export const useInsertArticleReadingRecord = () => {
    return useCallback(async (article_id: number, user_id: number) => {
        if(article_id === 0 || user_id === 0) return;
        const apiData: insertArticleReadingRecordRequestType = {
            articleId: article_id,
            userId: user_id,
        }
        const res: insertArticleReadingRecordResponseType = await apiClient(apiList.post.protected.article_reading_records.insert, {
            method: "POST",
            body: JSON.stringify(apiData)
        });
    }, [])
}

export const useGetArticleReadingRecordsByUserId = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        pageNum: 0,
        pageSize: 8,
    });
    const [messageApi, contextHandle] = useMessage();
    const [historyList, setHistoryList] = useState<(article_reading_recordsTableType & Pick<articleTableType, 'title' | 'summary' | 'author_nickname'>)[]>([]);
    const getHistoryList = useCallback(async ({ userId = 0, pageNum = 0, pageSize = 8, isInit = false }) => {
        if(isInit) {
            setHistoryList([]);
            setPageInfo({
                pageNum: 0,
                pageSize: 8,
            });
            setHasMore(true);
        }
        const apiData: getArticleReadingRecordsByUserIdRequestType = {
            userId,
            pageNum,
            pageSize,
        }
        const res: getArticleReadingRecordsByUserIdResponseType = await apiClient(apiList.post.protected.article_reading_records.getByUserId, {
            method: "POST",
            body: JSON.stringify(apiData)
        });
        if (res.msg === 'success') {
            if (res.data.length === 0) {
                messageApi.info('没有更多数据了');
                setHasMore(false);
                return;
            }
            if (isInit) {
                setHistoryList(res.data);
                return;
            }
            setHistoryList(preHistory => [
                ...preHistory,
                ...res.data,
            ]);
        } else {

        }
    }, [messageApi]);
    const loadMore = (userId: number) => {
        if(isLoading || !hasMore) return;
        setIsLoading(true);
        getHistoryList({userId, pageNum: pageInfo.pageNum + 1, pageSize: pageInfo.pageSize}).then(() => {
            setIsLoading(false);
            setPageInfo(prePageInfo => {
                return {
                    ...prePageInfo,
                    pageNum: prePageInfo.pageNum + 1,
                }
            });
        })
    }
    return { historyList, getHistoryList, contextHandle, loadMore }
}


export const useGetLookCountByUserId = () => {
    return useCallback(async (userId: number) => {
        const apiData: getLookCountsByUserIdRequestType = {
            userId,
        }
        const res: getLookCountsByUserIdResponseType = await apiClient(apiList.post.protected.article_reading_records.getLookCountByUserId, {
            method: "POST",
            body: JSON.stringify(apiData)
        });
        return res;
    }, [])
}