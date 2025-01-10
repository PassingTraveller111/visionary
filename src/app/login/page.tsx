"use client"
import { LoginForm } from "@/components/LoginForm/LoginForm";
import styles from './index.module.scss';
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector} from "@/store";
import {logIn, logOut} from "@/store/features/userSlice";


const LoginPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userInfo = useAppSelector((state) => {
        return state.rootReducer.userReducer.value;
    });
    const onlogIn = () => {
        dispatch(logIn({
            id: 111,
        }))
    }
    const onlogOut = () => {
        dispatch(logOut());
    }

    return <div className={styles.container}>
        <div>
            <h1>创见</h1>
        </div>
        <LoginForm />
    </div>;
}

export default LoginPage;