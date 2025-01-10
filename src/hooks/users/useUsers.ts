import {useRouter} from "next/navigation";
import {useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {logIn, logOut} from "@/store/features/userSlice";
import axios from "axios";


export const useUserLogin = () => {
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const dispatch = useDispatch();
    const router = useRouter();
    return async (username:string, password: string) => {
        const res = await axios.post("http://localhost:3000/api/user/login", {
            username,
            password
        })
        if (res.status === 200) {
            dispatch(logIn({
                ...userInfo,
                ...res.data.data,
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
        const res = await axios.get('http://localhost:3000/api/user/logout');
        if (res.status === 200)
        router.push('/login'); // 跳转login页
    }
}