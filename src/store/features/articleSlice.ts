import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type articleType = {
    articleId: number | 'new'; // 数字为编辑 new表示新建
    authorId: number; // 作者id
    title: string; // 标题
    content: string; // 内容
    authorName?: string; // 作者名
    publishTime?: string; // 发布时间
    views: number; // 浏览次数
    likes: number; // 点赞次数
}

type InitialStateType = {
    value: articleType,
}

const initialState: InitialStateType = {
    value: {
        articleId: 'new',
        authorId: 0,
        title: '',
        content: '',
        views: 0, // 浏览次数
        likes: 0, // 点赞次数
    }
};

export const articleSlice = createSlice({
    name: "article",
    initialState,
    reducers: {
        setArticle: (state, action: PayloadAction<articleType>) => {
            return {
                value: {
                    ...state.value,
                    ...action.payload,
                }
            }
        },
    }
})

export const { setArticle } = articleSlice.actions;
export default articleSlice.reducer;