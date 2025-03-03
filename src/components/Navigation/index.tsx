"use client"
import {Button, Input} from "antd";
import styles from './index.module.scss';
import {LogoIcon} from "@/components/LogoIcon";
import {useRouter} from "next/navigation";
import React from "react";
import {Profile} from "@/components/Profile";
import classNames from "classnames";
import {ArticleSearch} from "@/components/Navigation/components/ArticleSearch";

const Navigation = () => {
    const router = useRouter();
    return <div className={styles['nav-container']}>
        <span className={styles['nav-left']}>
            <span
                className={classNames(styles.logo)}
                onClick={() => {
                    router.push('/');
                }}
            >
                <LogoIcon/>
                创见
            </span>
        </span>
        <span className={styles['nav-right']}>
            <ArticleSearch/>
            <Button
                onClick={() => {
                    router.push('/creator/content/article');
                }}
            >创作</Button>
            <Profile/>
        </span>
    </div>
}

export default Navigation;