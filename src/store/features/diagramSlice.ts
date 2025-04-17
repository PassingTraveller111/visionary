

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type diagramType = {
    id: number | 'new'; // 数字为编辑 new表示新建
    title: string; // 标题
    data: string; // 内容
    intro: string; // 介绍
    tags: string[]; // 标签
    author_id: number; // 作者id
    cover: string;
}

type InitialStateType = {
    value: diagramType,
}

const initialState: InitialStateType = {
    value: {
        id: 'new',
        title: '',
        data: '',
        intro: '',
        tags: [],
        author_id: 0,
        cover: '',
    }
};

export const diagramSlice = createSlice({
    name: "draft",
    initialState,
    reducers: {
        setDiagram: (state, action: PayloadAction<diagramType>) => {
            return {
                value: {
                    ...state.value,
                    ...action.payload,
                }
            }
        },
    }
})

export const { setDiagram } = diagramSlice.actions;
export default diagramSlice.reducer;