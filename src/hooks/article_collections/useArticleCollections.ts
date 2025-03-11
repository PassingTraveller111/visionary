import {useCallback, useEffect, useState} from "react";
import {apiClient, apiList} from "@/clientApi";
import {
    setArticleIsCollectedRequestType,
    setArticleIsCollectedResponseType
} from "@/app/api/protected/article_collections/setArticleIsCollected/route";
import {
    getArticleIsCollectedRequestType,
    getArticleIsCollectedResponseType
} from "@/app/api/protected/article_collections/getArticleIsCollected/route";
import {useAppSelector} from "@/store";


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
        const res: setArticleIsCollectedResponseType = await apiClient(apiList.post.protected.article_collections.setArticleIsCollected, {
            method: 'POST',
            body: JSON.stringify(apiData),
        })
        if(res.msg === 'success') {
            setIsCollected(res.data.isCollected === 1);
        }
        setIsLoading(false);
    }, [isLoading]);
    const getArticleIsCollected = useCallback(async (userId: number, articleId: number) => {
        const apiData: getArticleIsCollectedRequestType = {
            userId,
            articleId,
        };
        const res: getArticleIsCollectedResponseType = await apiClient(apiList.post.protected.article_collections.getArticleIsCollected, {
            method: 'POST',
            body: JSON.stringify(apiData),
        });
        if(res.msg === 'success') {
            setIsCollected(res.data.isCollected === 1);
        }
    }, []);
    useEffect(() => {
        if(userInfo.id === 0 || article.articleId === 0) return;
        getArticleIsCollected(userInfo.id, article.articleId);
    }, [article.articleId, getArticleIsCollected, userInfo.id]);
    return { isCollected, setArticleIsCollected };
}