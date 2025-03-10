import {useCallback} from "react";
import {apiClient, apiList} from "@/clientApi";
import {
    getArticleLikeCountByUserIdResponseType
} from "@/app/api/protected/article_likes/getArticleLikeCountByUserId/route";


export const useGetArticleLikeCountByUserId = () => {
    return useCallback(async (userId: number) => {
        const res: getArticleLikeCountByUserIdResponseType = await apiClient(apiList.post.protected.article_likes.getArticleLikeCountByUserId, {
            method: 'POST',
            body: JSON.stringify({
                userId: userId,
            })
        });
        return res;
    }, []);
}