"use client"
import {Dropdown, Input, MenuProps} from "antd";
import styles from "./index.module.scss";
import React, {Suspense, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {getLocalStorageItem} from "@/utils/localStorageUtils";
import {IconFont} from "@/components/IconFont";

const ArticleSearch = () => {
    const router = useRouter();
    const initKeyWordHistory = JSON.parse(getLocalStorageItem("keywords") ?? '[]');
    const [keywordsHistory, setKeywordsHistory] = useState<string[]>(initKeyWordHistory);
    const searchParams = useSearchParams();
    const initKeyword = searchParams.get('keyword');
    const onSearch = (keyword: string) => {
        if(!keyword) return;
        localStorage.setItem('keywords', JSON.stringify([keyword, ...keywordsHistory]));
        router.push("/search?keyword=" + keyword);
    }
    const items: MenuProps['items'] = keywordsHistory.map((keyword: string, index) => {
        return {
            key: index,
            label: <SearchHistoryItem keyword={keyword} onDelete={(delKeyword) => {
                const newHistory = keywordsHistory.filter(item => item !== delKeyword);
                setKeywordsHistory(newHistory);
                localStorage.setItem('keywords', JSON.stringify(newHistory));
            }}/>,
            onClick: () => {
                onSearch(keyword);
            }
        }
    })
    return <Dropdown
        menu={{ items }}
    >
        <Input.Search
            className={styles.search}
            defaultValue={initKeyword ?? ''}
            placeholder='搜索'
            onSearch={onSearch}
        />
    </Dropdown>
}

const SuspenseArticleSearch = () => {
    return <Suspense>
        <ArticleSearch />
    </Suspense>
}


const SearchHistoryItem = (props: { keyword: string, onDelete: (keyword: string) => void }) => {
    const { keyword, onDelete } = props;
    const [isHover, setIsHover] = useState(false);
    return <div
        className={styles.searchHistoryItem}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
    >
        <span>
        {keyword}
        </span>
        {isHover && <IconFont type='icon-shanchu' onClick={() => {
            onDelete(keyword);
        }} />}
    </div>
}
export default SuspenseArticleSearch;