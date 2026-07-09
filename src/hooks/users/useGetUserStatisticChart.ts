import {useCallback, useState} from "react";
import {
    chartDataItemType,
    getUserStatisticChartReqType
} from "@/shared/api/user";
import {apiClient} from "@/clientApi";
import type {ApiResponse} from "@/shared/api/response";


export type chartListItemType = {
    name: string,
    look: number, // 阅读数
    like: number, // 点赞
    collect: number, // 收藏
    comment: number, // 评论
}

export const useGetUserStatisticChart = () => {
    const [chartData, setChartData] = useState<chartListItemType[]>([]);
    const getChartData = useCallback((startDate: string = '', endDate: string = '') => {
        const apiData: getUserStatisticChartReqType = {
            startDate,
            endDate,
        }
        apiClient(`users/me/statistics/chart?startDate=${encodeURIComponent(apiData.startDate)}&endDate=${encodeURIComponent(apiData.endDate)}`).then((res: ApiResponse<chartDataItemType[]>) => {
            if(res.ok)
            setChartData(res.data.map(item => {
                return {
                    name: item.date,
                    like: item.like_count,
                    look: item.read_count,
                    collect: item.collection_count,
                    comment: item.comment_count,
                }
            }));
        });
    }, []);
    return [chartData, getChartData] as [chartListItemType[], (startDate?: string, endDate?: string) => void];
}
