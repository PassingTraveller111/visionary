"use client"
import { Index } from "@/components/LoginForm";
import styles from './index.module.scss';
import {useUserLogin} from "@/hooks/users/useUsers";


const LoginPage = () => {
    const login = useUserLogin()
    const onLogin = async (username: string, password: string) => {
        await login(username, password);
    }
    return <div className={styles.container}>
        <div>
            <h1>创见</h1>
        </div>
        <Index onLogin={onLogin} />
    </div>;
}

export default LoginPage;