import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type articleType = {
    articleId: number | 'new'; // 数字为编辑 new表示新建
    authorId: number; // 作者id
    title: string; // 标题
    content: string; // 内容
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