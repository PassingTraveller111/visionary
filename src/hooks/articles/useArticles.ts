import {AppDispatch, useAppSelector} from "@/store";
import {apiClient, apiList} from "@/clientApi";
import {useDispatch} from "react-redux";
import {setArticle} from "@/store/features/articleSlice";
import {useCallback, useEffect, useState} from "react";
import {getArticleRequestType, getArticleResponseType} from "@/app/api/protected/article/getArticle/route";
import {getArticleListResponseType, itemType} from "@/app/api/protected/article/getArticleList/route";
import {
    getPublishedArticleListRequestType,
    getPublishedArticleListResponseType
} from "@/app/api/protected/article/getPublishedArticleList/route";
import useMessage from "antd/es/message/useMessage";
import {
    getArticleListByKeyWordRequestType,
    getArticleListByKeyWordResponseType
} from "@/app/api/protected/article/getArticleListByKeyWord/route";
import {
    getArticleIsLikeRequestType,
    getArticleIsLikeResponseType
} from "@/app/api/protected/article_likes/getArticleIsLike/route";
import {
    setArticleIsLikeRequestType,
    setArticleIsLikeResponseType
} from "@/app/api/protected/article_likes/setArticleIsLike/route";
import {getArticleCountByUserIdResponse} from "@/app/api/protected/article/getArticleCountByUserId/route";


export const useGetArticle = () => {
    const dispatch = useDispatch<AppDispatch>();
    return useCallback(async (id: number) => {
        const apiData: getArticleRequestType = {
            articleId: id
        }
        const res = await apiClient(apiList.post.protected.article.getArticle,  {
            method: 'POST',
            body: JSON.stringify(apiData)
        }) as getArticleResponseType;
        if (res.msg === 'success') {
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
        return await apiClient(apiList.post.protected.article.delArticle,  {
            method: 'POST',
            body: JSON.stringify({
                articleId: id,
            })
        });
    }
}

type articleListType = itemType[];

export const useGetArticleList = () => {
    // 文章列表数据
    const [articleList, setArticleList] = useState<articleListType>([]);
    // 获取文章列表
    const getArticleList =  useCallback((userId: number) => {
        if(!userId) return [];
        apiClient(apiList.post.protected.article.getArticleList, {
            method: "POST",
            body: JSON.stringify({
                authorId: userId,
            })
        }).then((res: getArticleListResponseType) => {
            return setArticleList(res.data);
        })
    }, []);
    return { articleList, getArticleList };
}

export const useGetPublishedArticleList = () => {
    const [articleList, setArticleList] = useState<getPublishedArticleListResponseType['data']>([]);
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
        const apiData: getPublishedArticleListRequestType = {
            pageNum,
            pageSize,
        };
        const res: getPublishedArticleListResponseType = await apiClient(apiList.post.protected.article.getPublishedArticleList, {
            method: 'POST',
            body: JSON.stringify(apiData)
        });
        if (res.msg === 'success') {
            if (res.data.length === 0) {
                messageApi.info('没有更多数据了');
                setHasMore(false);
                return;
            }
            if (isInit) {
                setArticleList(res.data);
                return;
            }
            setArticleList(preArticleList => [
                ...preArticleList,
                ...res.data,
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
    const [articleList, setArticleList] = useState<getArticleListByKeyWordResponseType['data']>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        pageNum: 0,
        pageSize: 8,
    });

    const [messageApi, contextHandle] = useMessage();
    const getArticleList = useCallback(async ({keyword = '', pageNum = 0, pageSize = 8, isInit = false }) => {
        const apiData: getArticleListByKeyWordRequestType = {
            pageNum,
            pageSize,
            keyword,
        };
        const res: getArticleListByKeyWordResponseType = await apiClient(apiList.post.protected.article.getArticleListByKeyWord, {
            method: 'POST',
            body: JSON.stringify(apiData)
        });
        if (res.msg === 'success') {
            if (res.data.length === 0) {
                messageApi.info('没有更多数据了');
                setHasMore(false);
                return;
            }
            if (isInit) {
                setArticleList(res.data);
                return;
            }
            setArticleList(preArticleList => [
                ...preArticleList,
                ...res.data,
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
        apiClient(apiList.post.protected.article_likes.getArticleIsLike, {
            method: 'POST',
            body: JSON.stringify(apiData)
        }).then((res: getArticleIsLikeResponseType) => {
            if (res.msg === 'success') {
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
        apiClient(apiList.post.protected.article_likes.setArticleIsLike, {
            method: 'POST',
            body: JSON.stringify(apiData),
        }).then((res: setArticleIsLikeResponseType) => {
            console.log(res);
            if (res.msg === 'success') {
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
        const res: getArticleCountByUserIdResponse = await apiClient(apiList.post.protected.article.getArticleCountByUserId, {
            method: 'POST',
            body: JSON.stringify({
                userId: userId,
            })
        })
        return res;
    }, [])
}