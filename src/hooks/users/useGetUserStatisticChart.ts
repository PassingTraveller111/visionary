import {useCallback, useState} from "react";
import {
    getUserStatisticChartReqType,
    getUserStatisticChartResType
} from "@/app/api/protected/user/getUserStatisticChart/route";
import {apiClient, apiList} from "@/clientApi";


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
        apiClient(apiList.post.protected.user.getUserStatisticChart, {
            method: "POST",
            body: JSON.stringify(apiData),
        }).then((res: getUserStatisticChartResType) => {
            if(res.msg === 'success')
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
