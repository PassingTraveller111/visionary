import {apiClient} from "@/clientApi";
import {useCallback, useState} from "react";
import {
    ArticleReadingRecordItem, getArticleReadingRecordsByUserIdRequestType
} from "@/shared/api/article_reading_records";
import useMessage from "antd/es/message/useMessage";
import {
    getLookCountsByUserIdRequestType, getLookCountsByUserIdResponseType, LookCount
} from "@/shared/api/article_reading_records";
import type {ApiResponse} from "@/shared/api/response";


export const useInsertArticleReadingRecord = () => {
    return useCallback(async (articleId: number) => {
        if(articleId === 0) return false;
        const res = await apiClient(`articles/${articleId}/reading-records`, {
            method: "POST",
        }) as ApiResponse<{ inserted: boolean }>;
        return res.ok && res.data.inserted;
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
    const [historyList, setHistoryList] = useState<ArticleReadingRecordItem[]>([]);
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
        const res = await apiClient(`users/${apiData.userId}/reading-records?pageNum=${apiData.pageNum}&pageSize=${apiData.pageSize}`) as ApiResponse<ArticleReadingRecordItem[]>;
        if (res.ok) {
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
        const res = await apiClient(`users/${apiData.userId}/look-count`) as ApiResponse<LookCount>;
        if (res.ok) return { msg: 'success' as const, data: res.data } satisfies getLookCountsByUserIdResponseType;
        return { msg: 'error' as const } satisfies getLookCountsByUserIdResponseType;
    }, [])
}
