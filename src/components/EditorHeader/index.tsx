import React from 'react'
import {Input} from "antd";
import {useDispatch} from "react-redux";
import {AppDispatch, useAppSelector} from "@/store";
import {setArticle} from "@/store/features/articleSlice";


const EditorHeader= () => {
    const article = useAppSelector(state => state.rootReducer.articleReducer.value);
    const dispatch = useDispatch<AppDispatch>();
    return <div>
        <Input value={article.title} onChange={(e) => {
            dispatch(setArticle({
                ...article,
                title: e.target.value
            }))
        }} />
    </div>
}

export default EditorHeader;