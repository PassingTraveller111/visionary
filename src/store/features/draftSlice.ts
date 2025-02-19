import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type draftType = {
    id: number | 'new'; // 数字为编辑 new表示新建
    title: string; // 标题
    content: string; // 内容
    summary: string; // 摘要
    tags: string[]; // 标签
    status: 'onlyDraft' | 'hasArticle'; // 仅草稿 ｜ 已有文章
    article_id: number; // 文章id
    review_id: number; // 审核id
    author_id: number; // 作者id
}

type InitialStateType = {
    value: draftType,
}

const initialState: InitialStateType = {
    value: {
        id: 'new',
        title: '',
        content: '',
        summary: '',
        tags: [],
        status: 'onlyDraft',
        article_id: 0,
        review_id: 0,
        author_id: 0,
    }
};

export const draftSlice = createSlice({
    name: "draft",
    initialState,
    reducers: {
        setDraft: (state, action: PayloadAction<draftType>) => {
            return {
                value: {
                    ...state.value,
                    ...action.payload,
                }
            }
        },
    }
})

export const { setDraft } = draftSlice.actions;
export default draftSlice.reducer;