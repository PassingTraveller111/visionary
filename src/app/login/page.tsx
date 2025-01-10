"use client"
import { LoginForm } from "@/components/LoginForm/LoginForm";
import styles from './index.module.scss';
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector} from "@/store";
import {useUserLogin} from "@/hooks/users/useUsers";


const LoginPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userInfo = useAppSelector((state) => {
        return state.rootReducer.userReducer.value;
    });
    const login = useUserLogin()
    const onLogin = async (username: string, password: string) => {
        await login(username, password);
    }
    return <div className={styles.container}>
        <div>
            <h1>创见</h1>
        </div>
        <LoginForm onLogin={onLogin} />
    </div>;
}

export default LoginPage;