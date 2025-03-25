import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {reviewTableType} from "@/app/api/sql/type";

export type reviewType = reviewTableType;

type InitialStateType = {
    value: reviewType,
}

const initialState: InitialStateType = {
    value: {
        id: 0,
        title: '',
        content: '',
        summary: '',
        tags: [],
        status: 'reviewing',
        article_id: 0,
        draft_id: 0,
        author_id: 0,
        author_nickname: "",
    }
};

export const reviewSlice = createSlice({
    name: "review",
    initialState,
    reducers: {
        setReview: (state, action: PayloadAction<reviewType>) => {
            return {
                value: {
                    ...state.value,
                    ...action.payload,
                }
            }
        },
    }
})

export const { setReview } = reviewSlice.actions;
export default reviewSlice.reducer;