import {Input} from "antd";
import styles from "./index.module.scss";
import React from "react";
import {useRouter, useSearchParams} from "next/navigation";

export const ArticleSearch = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initKeyword = searchParams.get('keyword');
    const onSearch = (keyword: string) => {
        if(!keyword) return;
        router.push("/search?keyword=" + keyword);
    }
    return <Input.Search
        className={styles.search}
        defaultValue={initKeyword ?? ''}
        placeholder='搜索'
        onSearch={onSearch}
    />
}