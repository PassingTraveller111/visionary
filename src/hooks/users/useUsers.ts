import {useRouter} from "next/navigation";
import {useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {logIn, logOut, setUserInfo} from "@/store/features/userSlice";
import {apiClient, apiList} from "@/clientApi";


export const useUserLogin = () => {
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const dispatch = useDispatch();
    const router = useRouter();
    return async (username:string, password: string) => {
        const res = await apiClient(apiList.post.user.login,  {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                password: password,
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
    const dispatch = useDispatch();
    return async () => {
        dispatch(logOut()); // 清除用户信息
        const res = await apiClient(apiList.get.user.logout);
        if (res.status === 200)
        router.push('/login'); // 跳转login页
    }
}

export const useGetUserInfo =  () => {
    const dispatch = useDispatch();
    return async () => {
        const res = await apiClient(apiList.get.protected.user.getUserInfo);
        dispatch(setUserInfo(res.data));
    }
}