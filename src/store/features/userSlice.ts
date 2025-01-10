import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserInfoType = {
    id: number;
}

type InitialStateType = {
    value: UserInfoType,
}

const initialState: InitialStateType = {
    value: {
        id: 0,
    }
};

export const userSlice = createSlice({
    name: "userInfo",
    initialState,
    reducers: {
        logIn: (state, action: PayloadAction<UserInfoType>) => {
            return {
                value: {
                    ...state,
                    ...action.payload,
                }
            }
        },
        logOut: () => {
            return initialState;
        }
    }
})

export const { logOut, logIn } = userSlice.actions;
export default userSlice.reducer;