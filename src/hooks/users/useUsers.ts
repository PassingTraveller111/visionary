import {useRouter} from "next/navigation";
import {useAppSelector, AppDispatch} from "@/store";
import {useDispatch} from "react-redux";
import {logIn, logOut, setUserInfo} from "@/store/features/userSlice";
import {apiClient, apiList} from "@/clientApi";


export const useUserLogin = () => {
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    return async (username:string, password: string, isRemember: boolean = false) => {
        const res = await apiClient(apiList.post.user.login,  {
            method: 'POST',
            body: JSON.stringify({
                username,
                password,
                isRemember,
            })
        });
        if (res.status === 200) {
            dispatch(logIn({
                ...userInfo,
                ...res.data,
            }))
            router.push("/");
        }
        return res;
    }
}

export const useUserLogout = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    return async () => {
        dispatch(logOut()); // 清除用户信息
        const res = await apiClient(apiList.get.user.logout);
        if (res.status === 200)
        router.push('/login'); // 跳转login页
    }
}

export const useGetUserInfo =  () => {
    const dispatch = useDispatch<AppDispatch>();
    return async () => {
        const res = await apiClient(apiList.get.protected.user.getUserInfo);
        dispatch(setUserInfo(res.data));
    }
}