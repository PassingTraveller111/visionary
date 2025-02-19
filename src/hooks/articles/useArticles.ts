import {AppDispatch, useAppSelector} from "@/store";
import {apiClient, apiList} from "@/clientApi";
import {useDispatch} from "react-redux";
import {setArticle} from "@/store/features/articleSlice";
import {useState} from "react";
import {updateArticleDataType} from "@/app/api/protected/article/updateArticle/route";
import {getArticleRequestType, getArticleResponseType} from "@/app/api/protected/article/getArticle/route";
import {getArticleListResponseType, itemType} from "@/app/api/protected/article/getArticleList/route";


export const useUpdateArticle = () => {
    const article = useAppSelector(state => state.rootReducer.articleReducer.value);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value)
    return async (content: string) => {
        const apiData: updateArticleDataType = {
            content,
            articleId: article.articleId,
            authorId: userInfo.id,
            author_nickname: userInfo.nick_name ?? '',
            title: article.title,
        }
        return await apiClient(apiList.post.protected.article.updateArticle,  {
            method: 'POST',
            body: JSON.stringify(apiData),
        });
    }
}


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
            const { title, id, content, author_nickname, author_id, published_time, views, is_published, updated_time, draft_id, likes, review_id, review_status, tags, summary, collects } = res.data;
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
                    likes,
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