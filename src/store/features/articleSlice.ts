import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type articleType = {
    articleId: number | 'new'; // 数字为编辑 new表示新建
    authorId: number; // 作者id
    title: string; // 标题
    content: string; // 内容
    authorName?: string; // 作者名
    publishTime?: string; // 发布时间
    views: number; // 浏览次数
    like_count: number; // 点赞次数
    is_published: 0 | 1; // 0:未发布；1:已发布；
    updated_time: string; // 更新时间
    draft_id?: number; // 草稿id
    review_id?: number; // 审核id
    review_status: reviewStatusType; // 审核状态
    tags: string[]; // 标签
    summary: string; // 摘要
    collects: number; // 收藏数
}

export type reviewStatusType = 'pending_review' | 'failed_review' | 'already_review';

type InitialStateType = {
    value: articleType,
}

const initialState: InitialStateType = {
    value: {
        articleId: 'new',
        authorId: 0,
        title: '',
        content: '',
        views: 0,
        like_count: 0,
        is_published: 0,
        updated_time: "",
        draft_id: 0,
        review_id: 0,
        review_status: "pending_review",
        tags: [],
        summary: "",
        collects: 0
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