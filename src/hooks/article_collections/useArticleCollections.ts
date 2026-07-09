import {useCallback, useEffect, useState} from "react";
import {apiClient} from "@/clientApi";
import {
    setArticleIsCollectedRequestType,
} from "@/shared/api/article_collections";
import {
    getArticleIsCollectedRequestType,
} from "@/shared/api/article_collections";
import {useAppSelector} from "@/store";
import {
    ArticleCollectionItem, ArticleCollectionState, getArticleCollectionsByUserIdRequestType, getArticleCollectionsByUserIdResponseType
} from "@/shared/api/article_collections";
import type {ApiResponse} from "@/shared/api/response";


export const useSetArticleIsCollected = () => {
    const [isCollected, setIsCollected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const article = useAppSelector(state => state.rootReducer.articleReducer.value);
    const setArticleIsCollected =  useCallback(async (userId: number, articleId: number, isCollected: boolean) => {
        if (isLoading) return;
        setIsLoading(true);
        const apiData: setArticleIsCollectedRequestType = {
            userId,
            articleId,
            isCollected,
        }
        const res = await apiClient(`articles/${apiData.articleId}/collection`, {
            method: 'PUT',
            body: JSON.stringify({ isCollected: apiData.isCollected }),
        }) as ApiResponse<ArticleCollectionState>;
        if(res.ok) {
            setIsCollected(res.data.isCollected === 1);
        }
        setIsLoading(false);
    }, [isLoading]);
    const getArticleIsCollected = useCallback(async (userId: number, articleId: number) => {
        const apiData: getArticleIsCollectedRequestType = {
            userId,
            articleId,
        };
        const res = await apiClient(`articles/${apiData.articleId}/collection`) as ApiResponse<ArticleCollectionState>;
        if(res.ok) {
            setIsCollected(res.data.isCollected === 1);
        }
    }, []);
    useEffect(() => {
        if(userInfo.id === 0 || article.articleId === 0) return;
        getArticleIsCollected(userInfo.id, article.articleId);
    }, [article.articleId, getArticleIsCollected, userInfo.id]);
    return { isCollected, setArticleIsCollected };
}


export const useArticleCollections = () => {
    const [ collectionList, setCollectionList ] = useState<getArticleCollectionsByUserIdResponseType['data']>([]);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const getArticleCollections = useCallback(async (userId: number) => {
        const apiData: getArticleCollectionsByUserIdRequestType = {
            userId,
        };
        const res = await apiClient(`users/${apiData.userId}/collections`) as ApiResponse<ArticleCollectionItem[]>;
        if(res.ok) {
            setCollectionList(res.data);
        }
        if (res.ok) return { msg: 'success' as const, data: res.data } satisfies getArticleCollectionsByUserIdResponseType;
        return { msg: 'error' as const, data: [] } satisfies getArticleCollectionsByUserIdResponseType;
    }, []);
    useEffect(() => {
        if(userInfo.id === 0) return;
        getArticleCollections(userInfo.id)
    }, [getArticleCollections, userInfo.id]);
    return { collectionList, getArticleCollections };
}
