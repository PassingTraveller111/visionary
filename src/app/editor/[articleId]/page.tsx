"use client"
import MdEditor from "@/components/MdEditor";
import {useParams} from "next/navigation";
import {AppDispatch, useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {setArticle} from "@/store/features/articleSlice";
import {useCallback, useEffect} from "react";
import {useGetArticle} from "@/hooks/articles/useArticles";
import EditorHeader from "@/components/EditorHeader";


const EditorPage = () => {
    const { articleId } =  useParams();
    const article = useAppSelector(state => state.rootReducer.articleReducer.value);
    const getArticle = useGetArticle();
    const dispatch = useDispatch<AppDispatch>();
    // 初始化article
    const initArticle = useCallback(() => {
        const id = articleId === 'new' ? articleId : Number(articleId);
        dispatch(setArticle({
            ...article,
            articleId: id
        }))
        if(typeof id === 'number')
            getArticle(id);
    }, [articleId]);
    useEffect(() => {
       initArticle();
    }, [initArticle])
    return <>
        <EditorHeader />
        <MdEditor initialValue={article.content} />
    </>
}
export default EditorPage;