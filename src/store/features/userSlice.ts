import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserInfoType = {
    login: boolean;
    id: number;
    username?: string; // 账号
    email?: string; // 电子邮箱
    firstName?: string; // 姓
    lastName?: string; // 名
    role: roleEnum;
    profile?: string; // 头像
    nick_name: string; // 昵称
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
        login: false,
        id: 0,
        role: roleEnum.GUEST,
        nick_name: "",
    }
};

export const userSlice = createSlice({
    name: "userInfo",
    initialState,
    reducers: {
        logIn: (state, action: PayloadAction<UserInfoType>) => {
            return {
                value: {
                    ...state.value,
                    ...action.payload,
                    login: true,
                }
            }
        },
        logOut: () => {
            return initialState;
        },
        setUserInfo: (state, action: PayloadAction<UserInfoType>) => {
            return {
                value: {
                    ...state.value,
                    ...action.payload,
                    login: true,
                }
            }
        }
    }
})

export const { logOut, logIn, setUserInfo } = userSlice.actions;
export default userSlice.reducer;