import { LoginForm } from "@/components/LoginForm/LoginForm";
import styles from './index.module.scss';

const LoginPage = () => {
    return <div className={styles.container}>
        <div>
            <h1>创见</h1>
        </div>
        <LoginForm />
    </div>;
}

export default LoginPage;