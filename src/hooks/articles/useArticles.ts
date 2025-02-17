import {AppDispatch, useAppSelector} from "@/store";
import {apiClient, apiList} from "@/clientApi";
import {useDispatch} from "react-redux";
import {setArticle} from "@/store/features/articleSlice";
import {useState} from "react";
import {updateArticleDataType} from "@/app/api/protected/article/updateArticle/route";


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

type articleDataType = {
    "id": number,
    "title": string,
    "summary": string,
    content: string,
    "author_id": number,
    "published_time": string,
    "updated_time": string,
    "is_published": 0 | 1,
    "views": number,
    "likes": number,
    "collects": number,
    "tags": string,
    "author_nickname": string,
}

export const useGetArticle = () => {
    const article = useAppSelector(state => state.rootReducer.articleReducer.value);
    const dispatch = useDispatch<AppDispatch>();
    return async (id?: number) => {
        const res = await apiClient(apiList.post.protected.article.getArticle,  {
            method: 'POST',
            body: JSON.stringify({
                articleId: id ?? article.articleId,
            })
        });
        if (res.msg === 'success') {
            const { title, id, content, author_nickname, author_id, published_time, views } = res.data as articleDataType;
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


type articleType = {
    title: string;
    id: number;
    updated_time: string;
}
export const useGetArticleList = () => {
    // 文章列表数据
    const [articleList, setArticleList] = useState<articleType[]>([]);
    // 获取文章列表
    const getArticleList =  (userId: number) => {
        apiClient(apiList.post.protected.article.getArticleList, {
            method: "POST",
            body: JSON.stringify({
                authorId: userId,
            })
        }).then(res => {
            setArticleList(res.data);
        })
    };
    return { articleList, getArticleList };
}