"use client"
import { LoginForm } from "@/components/LoginForm/LoginForm";
import styles from './index.module.scss';
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector} from "@/store";
import axios from "axios";


const LoginPage = () => {
    // const dispatch = useDispatch<AppDispatch>();
    // const userInfo = useAppSelector((state) => {
    //     return state.rootReducer.userReducer.value;
    // });
    const onLogin = async (username: string, password: string) => {
        const res = await axios.post("http://localhost:3000/api/user/login", {
            username,
            password
        });
        console.log(res);
    }
    return <div className={styles.container}>
        <div>
            <h1>创见</h1>
        </div>
        <LoginForm onLogin={onLogin} />
    </div>;
}

export default LoginPage;