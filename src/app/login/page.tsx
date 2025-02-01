"use client"
import LoginForm from "@/components/LoginForm";
import styles from './index.module.scss';
import {useUserLogin} from "@/hooks/users/useUsers";


const LoginPage = () => {
    const login = useUserLogin()
    const onLogin = async (username: string, password: string, isRemember: boolean) => {
        return await login(username, password, isRemember);
    }
    return <div className={styles.container}>
        <div>
            <h1>创见</h1>
        </div>
        <LoginForm onLogin={onLogin} />
    </div>;
}

export default LoginPage;