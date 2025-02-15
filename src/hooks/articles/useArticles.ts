import {AppDispatch, useAppSelector} from "@/store";
import {apiClient, apiList} from "@/clientApi";
import {useDispatch} from "react-redux";
import {setArticle} from "@/store/features/articleSlice";


export const useUpdateArticle = () => {
    const article = useAppSelector(state => state.rootReducer.articleReducer.value);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value)
    return async (content: string) => {
        return await apiClient(apiList.post.protected.article.updateArticle,  {
            method: 'POST',
            body: JSON.stringify({
                content,
                articleId: article.articleId,
                authorId: userInfo.id,
                author_nickname: userInfo.nick_name,
                title: article.title,
            })
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