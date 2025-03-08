import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type assistantType = {
    chat_id: number;
    chat_content: {
        content: string; // 内容
        role: 'user' | 'assistant'; // 用户 ｜ 助手
        sendTime: string; // 发送时间
    }[];
    draft_id: number; // 草稿id
}

type InitialStateType = {
    value: assistantType,
}

const initialState: InitialStateType = {
    value: {
        chat_id: 0,
        chat_content: [],
        draft_id: 0,
    }
};

export const assistantSlice = createSlice({
    name: "assistant",
    initialState,
    reducers: {
        setAssistant: (state, action: PayloadAction<assistantType>) => {
            return {
                value: {
                    ...state.value,
                    ...action.payload,
                }
            }
        },
    }
})

export const { setAssistant } = assistantSlice.actions;
export default assistantSlice.reducer;