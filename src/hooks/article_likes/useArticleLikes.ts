import {useCallback} from "react";
import {apiClient} from "@/clientApi";
import {
    ArticleLikeCount,
    getArticleLikeCountByUserIdResponseType
} from "@/shared/api/article_likes";
import type {ApiResponse} from "@/shared/api/response";


export const useGetArticleLikeCountByUserId = () => {
    return useCallback(async (userId: number) => {
        const res = await apiClient(`users/${userId}/like-count`) as ApiResponse<ArticleLikeCount>;
        if (res.ok) return { msg: 'success' as const, data: res.data } satisfies getArticleLikeCountByUserIdResponseType;
        return { msg: 'error' as const } satisfies getArticleLikeCountByUserIdResponseType;
    }, []);
}
