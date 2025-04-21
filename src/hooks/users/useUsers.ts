import {useRouter} from "next/navigation";
import {useAppSelector, AppDispatch} from "@/store";
import {useDispatch} from "react-redux";
import {logIn, logOut, setLoading, setUserInfo} from "@/store/features/userSlice";
import {apiClient, apiList} from "@/clientApi";
import {useCallback, useState} from "react";
import {
    AuthorInfoType,
    getAuthorInfoRequestType,
    getAuthorInfoResponseType
} from "@/app/api/protected/user/getAuthorInfo/route";


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
    return () => {
        setLoading({
            isLoading: true,
        });
        apiClient(apiList.get.protected.user.getUserInfo).then(res => {
            dispatch(setUserInfo(
                res.data
            ));
            setLoading({
                isLoading: false,
            })
        })
    }
}
// 用于判断是否是本人
export const useIsUserOwn = () => {
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    return useCallback((idOrUserName: number | string) => {
        if(typeof idOrUserName === "string") {
            return idOrUserName === userInfo.username;
        }
        return idOrUserName === userInfo.id;
    }, [userInfo.id, userInfo.username])
}

export const useGetAuthorInfo = () => {
    const [authorInfo, setAuthorInfo] = useState<AuthorInfoType>({
        id: 0, email: "", nick_name: "", profile: ""
    });
    const getAuthorInfo = useCallback((id: number) => {
        const apiData: getAuthorInfoRequestType = {
            authorId: id,
        }
        apiClient(apiList.post.protected.user.getAuthorInfo, {
            method: 'POST',
            body: JSON.stringify(apiData),
        }).then((res: getAuthorInfoResponseType) => {
            setAuthorInfo(res.data);
        })
    }, [])
    return { authorInfo, getAuthorInfo };
}