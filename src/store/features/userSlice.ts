import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserInfoType = {
    id: number;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role: roleEnum;
    profile?: string;
}

enum roleEnum {
    ADMIN = 2,
    USER = 1,
    GUEST = 0,
}

type InitialStateType = {
    value: UserInfoType,
}

const initialState: InitialStateType = {
    value: {
        id: 0,
        role: roleEnum.GUEST,
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
        },
        setUserInfo: (state, action: PayloadAction<UserInfoType>) => {
            return {
                value: {
                    ...state,
                    ...action.payload,
                }
            }
        }
    }
})

export const { logOut, logIn, setUserInfo } = userSlice.actions;
export default userSlice.reducer;