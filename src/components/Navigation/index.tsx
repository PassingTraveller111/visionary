import {Button, Input} from "antd";
import styles from './index.module.scss';
import {LogoIcon} from "@/components/LogoIcon";
import {useRouter} from "next/navigation";
import React from "react";
import {Profile} from "@/components/Profile";

const Navigation = () => {
    const router = useRouter();

    return <div className={styles['nav-container']}>
        <span
            className={styles.logo}
            onClick={() => {
                router.push('/');
            }}
        >
            <LogoIcon />
            创见
        </span>
        <Input.Search className={styles.search}/>
        <Button>创作</Button>
        <Profile />
    </div>
}

export default Navigation;