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
                title: article.title,
            })
        });
    }
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
            dispatch(setArticle(res.data));
        }
        return res;
    }
}