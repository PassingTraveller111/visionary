"use client"
import {Button} from "antd";
import styles from './index.module.scss';
import {LogoIcon} from "@/components/LogoIcon";
import {useRouter} from "next/navigation";
import React from "react";
import {Profile} from "@/components/Profile";
import classNames from "classnames";
import ArticleSearch from "@/components/Navigation/components/ArticleSearch";
import {useAppSelector} from "@/store";
import Link from "next/link";

const Navigation = () => {
    const router = useRouter();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);

    return <div className={styles['nav-container']}>
        <span className={styles['nav-left']}>
            <Link
                href="/"
                aria-label="创见博客首页"
                className={classNames(styles.logo)}
            >
                <LogoIcon/>
                <span className={styles.logoText}>创见博客</span>
            </Link>
        </span>
        <span className={styles['nav-right']}>
            <ArticleSearch/>
            <Button
                className={styles.creatorButton}
                onClick={() => {
                    router.push('/creator/home');
                }}
            >创作中心</Button>
            {userInfo.login ? <Profile/> : <Button type="primary" onClick={() => router.push('/login')}>登录</Button>}
        </span>
    </div>
}

export default Navigation;
