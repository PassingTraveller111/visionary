import {AppDispatch, useAppSelector} from "@/store";
import {apiClient} from "@/clientApi";
import {useDispatch} from "react-redux";
import {setArticle} from "@/store/features/articleSlice";
import {useCallback, useEffect, useState} from "react";
import useMessage from "antd/es/message/useMessage";
import {
    ArticleLikeState,
    getArticleIsLikeRequestType,
} from "@/shared/api/article_likes";
import {
    setArticleIsLikeRequestType,
} from "@/shared/api/article_likes";
import type {ArticleDto, ArticleListItemDto, ArticleQueryResult, PublishedArticleItemDto} from "@/shared/api/article";
import type {ApiResponse} from "@/shared/api/response";


export const useGetArticle = () => {
    const dispatch = useDispatch<AppDispatch>();
    return useCallback(async (id: number) => {
        const res = await apiClient(`articles/${id}`) as ApiResponse<ArticleDto>;
        if (res.ok) {
            const { title, id, content, author_nickname, author_id, published_time, is_published, updated_time, draft_id, review_id, review_status, tags, summary, collects } = res.data;
            dispatch(setArticle(
                {
                    articleId: id,
                    title,
                    content,
                    publishTime: published_time,
                    authorId: author_id,
                    authorName: author_nickname,
                    is_published,
                    updated_time,
                    draft_id,
                    review_id,
                    review_status,
                    tags,
                    summary,
                    collects,
                }
            ));
        }
        return res;
    }, [dispatch])
}

export const useDelArticle =() => {
    return async (id?: number) => {
        if (!id) return { msg: 'error' as const };
        const res = await apiClient(`articles/${id}`, { method: 'DELETE' }) as ApiResponse<string>;
        if (res.ok) return { msg: 'success' as const, data: res.data };
        return { msg: 'error' as const };
    }
}

type articleListType = ArticleListItemDto[];

export const useGetArticleList = () => {
    // 文章列表数据
    const [articleList, setArticleList] = useState<articleListType>([]);
    // 获取文章列表
    const getArticleList =  useCallback((userId: number) => {
        if(!userId) return [];
        apiClient(`users/${userId}/articles`).then((res: ApiResponse<ArticleListItemDto[]>) => {
            if (res.ok) return setArticleList(res.data);
        })
    }, []);
    return { articleList, getArticleList };
}

export const useGetPublishedArticleList = () => {
    const [articleList, setArticleList] = useState<PublishedArticleItemDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        pageNum: 0,
        pageSize: 8,
    });
    const [messageApi, contextHandle] = useMessage();
    const getPublishedArticleList = useCallback(async ({ pageNum = 0, pageSize = 8, isInit = false }) => {
        if(isInit) {
            setArticleList([]);
            setPageInfo({
                pageNum: 0,
                pageSize: 8,
            });
            setHasMore(true);
        }
        const res = await apiClient(`articles?pageNum=${pageNum}&pageSize=${pageSize}`) as ApiResponse<ArticleQueryResult>;
        if (res.ok) {
            if (res.data.items.length === 0) {
                messageApi.info('没有更多数据了');
                setHasMore(false);
                return;
            }
            if (isInit) {
                setArticleList(res.data.items);
                return;
            }
            setArticleList(preArticleList => [
                ...preArticleList,
                ...res.data.items,
            ]);
        }
    }, [messageApi]);
    const loadMore = () => {
        if(isLoading || !hasMore) return;
        setIsLoading(true);
        getPublishedArticleList({ pageNum: pageInfo.pageNum + 1, pageSize: pageInfo.pageSize}).then(() => {
            setIsLoading(false);
            setPageInfo(prePageInfo => {
                return {
                    ...prePageInfo,
                    pageNum: prePageInfo.pageNum + 1,
                }
            });
        })
    }
    return { articleList, getPublishedArticleList, loadMore, messageContext: contextHandle };
}

export const useGetPublishedArticleListByKeyWord = () => {
    const [articleList, setArticleList] = useState<PublishedArticleItemDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        pageNum: 0,
        pageSize: 8,
    });

    const [messageApi, contextHandle] = useMessage();
    const getArticleList = useCallback(async ({keyword = '', pageNum = 0, pageSize = 8, isInit = false }) => {
        const res = await apiClient(`articles?keyword=${encodeURIComponent(keyword)}&pageNum=${pageNum}&pageSize=${pageSize}`) as ApiResponse<ArticleQueryResult>;
        if (res.ok) {
            if (res.data.items.length === 0) {
                messageApi.info('没有更多数据了');
                setHasMore(false);
                return;
            }
            if (isInit) {
                setArticleList(res.data.items);
                return;
            }
            setArticleList(preArticleList => [
                ...preArticleList,
                ...res.data.items,
            ]);
        }
    }, [ messageApi ]);
    const loadMore = () => {
        if(isLoading || !hasMore) return;
        setIsLoading(true);
        getArticleList({ pageNum: pageInfo.pageNum + 1, pageSize: pageInfo.pageSize}).then(() => {
            setIsLoading(false);
            setPageInfo(prePageInfo => {
                return {
                    ...prePageInfo,
                    pageNum: prePageInfo.pageNum + 1,
                }
            });
        })
    }
    return { articleList, getArticleList, loadMore, messageContext: contextHandle };
}


export const useArticleLike = () => {
    const [isLike, setIsLike] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const article = useAppSelector(state => state.rootReducer.articleReducer.value);
    // 根据userId和articleId判断是否like该文章
    const getArticleIsLike = useCallback((userId: number, articleId: number) => {
        if(isLoading) return;
        setIsLoading(true);
        const apiData: getArticleIsLikeRequestType = {
            userId,
            articleId: articleId as number,
        }
        apiClient(`articles/${apiData.articleId}/like`).then((res: ApiResponse<ArticleLikeState>) => {
            if (res.ok) {
                setIsLike(res.data.isLike);
            }
        })
        setIsLoading(false);
    }, [isLoading])
    const setArticleIsLike = useCallback((userId: number, articleId: number, like: boolean) => {
        if(isLoading) return;
        setIsLoading(true);
        const apiData: setArticleIsLikeRequestType = {
            userId,
            articleId,
            isLike: like,
        }
        apiClient(`articles/${apiData.articleId}/like`, {
            method: 'PUT',
            body: JSON.stringify({ isLike: apiData.isLike }),
        }).then((res: ApiResponse<ArticleLikeState>) => {
            console.log(res);
            if (res.ok) {
                setIsLoading(false);
                setIsLike(res.data.isLike);
            }

        })
    }, [isLoading]);
    useEffect(() => {
        if(userInfo.id === 0 || article.articleId === 0) return;
        getArticleIsLike(userInfo.id, article.articleId);
    }, [article.articleId, getArticleIsLike, userInfo.id])
    return { isLike, setArticleIsLike };
}


export const useGetArticleCountByUserId = () => {
    return useCallback(async (userId: number) => {
        const res = await apiClient(`users/${userId}/article-count`) as ApiResponse<{ articleCounts: number }>;
        if (res.ok) return { msg: 'success' as const, data: res.data };
        return { msg: 'error' as const };
    }, [])
}
