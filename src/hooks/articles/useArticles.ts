import {AppDispatch, useAppSelector} from "@/store";
import {apiClient, apiList} from "@/clientApi";
import {useDispatch} from "react-redux";
import {setArticle} from "@/store/features/articleSlice";
import {useCallback, useState} from "react";
import {getArticleRequestType, getArticleResponseType} from "@/app/api/protected/article/getArticle/route";
import {getArticleListResponseType, itemType} from "@/app/api/protected/article/getArticleList/route";
import {
    getPublishedArticleListRequestType,
    getPublishedArticleListResponseType, publishedItemType
} from "@/app/api/protected/article/getPublishedArticleList/route";
import useMessage from "antd/es/message/useMessage";
import {
    getArticleListByKeyWordRequestType,
    getArticleListByKeyWordResponseType
} from "@/app/api/protected/article/getArticleListByKeyWord/route";
import {useSearchParams} from "next/navigation";


export const useGetArticle = () => {
    const article = useAppSelector(state => state.rootReducer.articleReducer.value);
    const dispatch = useDispatch<AppDispatch>();
    return async (id?: number) => {
        const apiData: getArticleRequestType = {
            articleId: id ?? article.articleId as number,
        }
        const res = await apiClient(apiList.post.protected.article.getArticle,  {
            method: 'POST',
            body: JSON.stringify(apiData)
        }) as getArticleResponseType;
        if (res.msg === 'success') {
            const { title, id, content, author_nickname, author_id, published_time, views, is_published, updated_time, draft_id, review_id, review_status, tags, summary, collects } = res.data;
            dispatch(setArticle(
                {
                    ...article,
                    articleId: id,
                    title,
                    views,
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
    }
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
    const getArticleList =  (userId: number) => {
        if(!userId) return [];
        apiClient(apiList.post.protected.article.getArticleList, {
            method: "POST",
            body: JSON.stringify({
                authorId: userId,
            })
        }).then((res: getArticleListResponseType) => {
            return setArticleList(res.data);
        })
    };
    return { articleList, getArticleList };
}

type publishedArticleListType = publishedItemType[];
export const useGetPublishedArticleList = () => {
    const [articleList, setArticleList] = useState<publishedArticleListType>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        pageNum: 0,
        pageSize: 8,
    });
    const [messageApi, contextHandle] = useMessage();
    const getPublishedArticleList = useCallback(async ({ pageNum = 0, pageSize = 8, isInit = false }) => {
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
    const [articleList, setArticleList] = useState<publishedArticleListType>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        pageNum: 0,
        pageSize: 8,
    });
    const searchParams = useSearchParams();
    const initKeyword = searchParams.get('keyword');
    const [messageApi, contextHandle] = useMessage();
    const getArticleList = useCallback(async ({ pageNum = 0, pageSize = 8, isInit = false }) => {
        const apiData: getArticleListByKeyWordRequestType = {
            pageNum,
            pageSize,
            keyword: initKeyword ?? '',
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
    }, [initKeyword, messageApi]);
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