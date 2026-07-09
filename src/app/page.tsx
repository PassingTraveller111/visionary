"use client"
import NavLayout from "@/components/NavLayout";
import {useGetArticleCountByUserId, useGetPublishedArticleList} from "@/hooks/articles/useArticles";
import React, {useEffect, useState} from "react";
import styles from './index.module.scss';
import { useRouter } from "next/navigation";
import {Skeleton, Tabs, TabsProps} from "antd";
import Image from "next/image";
import {useAppSelector} from "@/store";
import {apiClient} from "@/clientApi";
import type {QuoteDto} from "@/shared/api/quotes";
import type {getArticleCountByUserIdResponse} from "@/shared/api/article";
import {
    getArticleLikeCountByUserIdResponseType
} from "@/shared/api/article_likes";
import {useGetLookCountByUserId} from "@/hooks/article_reading_records/useArticleReadingRecords";
import {useGetArticleLikeCountByUserId} from "@/hooks/article_likes/useArticleLikes";
import ArticleItem from "@/components/ArticleItem";
import type {ApiResponse} from "@/shared/api/response";



type tabKeysType = 'new' | 'hot';

export default function Home() {
    const [currentTab, setCurrentTab] = useState<tabKeysType>('new');
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const { articleList, getPublishedArticleList, loadMore, messageContext } = useGetPublishedArticleList();
    useEffect(() => {
        getPublishedArticleList({ isInit: true });
    }, [getPublishedArticleList, currentTab]);
    const items: TabsProps['items'] = [
        {
            key: 'new',
            label: <span
                className={styles.tabLabel}
            >最新</span>,
            children: <ArticleList
                articleList={articleList}
            />,
        },
        {
            key: 'hot',
            label: <span
                className={styles.tabLabel}
            >热门</span>,
            children: <ArticleList
                articleList={articleList}
            />,
        },
    ];
    return (
        <div>
            <NavLayout>
            {messageContext}
                <div
                    className={styles.container}
                    onScroll={(e) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        const {scrollTop, clientHeight, scrollHeight} = e.target;
                        if (scrollTop + clientHeight >= scrollHeight) {
                            loadMore();
                        }
                    }}
                >
                    <Tabs
                        className={`${styles.tabContainer} ${!userInfo.login ? styles.tabContainerFull : ''}`}
                        items={items}
                        onChange={(tabKey) => {
                            setCurrentTab(tabKey as tabKeysType);
                        }}
                    />
                    {userInfo.login && <div className={styles.leftBar}>
                        <UserBar/>
                    </div>}
                </div>
            </NavLayout>
        </div>
    );
}


const UserBar = () => {
    const router = useRouter();
    const [quote, setQuote] = useState('');
    const getLookCount = useGetLookCountByUserId();
    const getArticleCount = useGetArticleCountByUserId();
    const getLikeCount = useGetArticleLikeCountByUserId();
    const [articleCount, setArticleCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    const [lookCount, setLookCount] = useState(0);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const gotoUserCenter = () => {
        router.push('/userCenter/' + userInfo.id + '/article');
    }
    useEffect(() => {
        apiClient('quotes/random').then((res: ApiResponse<QuoteDto>) => {
            if(res.ok) setQuote(res.data.quote_text);
        });
    }, []);
    useEffect(() => {
        if(userInfo.id === 0) return;
        getArticleCount(userInfo.id).then((res: getArticleCountByUserIdResponse) => {
            if(res.msg === 'success') setArticleCount(res.data.articleCounts);
        });
        getLikeCount(userInfo.id).then((res: getArticleLikeCountByUserIdResponseType) => {
            if(res.msg === 'success') setLikeCount(res.data.like_count);
        });
        getLookCount(userInfo.id).then(res => {
            if(res.msg === 'success') setLookCount(res.data.look_count);
        })
    }, [getArticleCount, getLikeCount, getLookCount, userInfo.id]);
    return <div className={styles.userBar}>
        <div className={styles.top}>
            <div className={styles.avatar}>
                {userInfo?.profile && <Image src={userInfo.profile} width={60} height={60} alt='avatar'/>}
            </div>
            <div className={styles.userInfo}>
                <div className={styles.nickName}
                     onClick={() => {
                         gotoUserCenter();
                     }}
                >{userInfo?.nick_name}</div>
                <div>{userInfo?.email}</div>
            </div>
        </div>
        {quote && <div className={styles.center}>
            {quote}
        </div>}
        <div className={styles.bottom}>
            <span
                className={styles.bottomItem}
                onClick={() => {
                    gotoUserCenter();
                }}
            >
                <div>{articleCount}</div>
                <div>文章</div>
            </span>
            <span
                className={styles.bottomItem}
                onClick={() => {
                    gotoUserCenter();
                }}
            >
                <div>{lookCount}</div>
                <div>阅读</div>
            </span>
            <span
                className={styles.bottomItem}
                onClick={() => {
                    gotoUserCenter();
                }}
            >
                <div>{likeCount}</div>
                <div>获赞</div>
            </span>
        </div>
    </div>
}

type ArticleListItemType = {
    id: number;
    title: string;
    summary: string;
    author_nickname: string;
    updated_time: string;
    like_count: number;
    look_count: number;
    tags: string[];
    cover?: string;
}

const ArticleList = (props: {
    articleList: ArticleListItemType[] }) => {
    const {articleList} = props;
    return <div
        className={styles.articleList}
    >
        {
            articleList.length === 0 ?
                <Skeleton active/>
                :
                articleList.map((article) => {
                    return <ArticleItem
                        key={article.id}
                        title={article.title}
                        articleId={article.id}
                        author={article.author_nickname}
                        updateTime={article.updated_time}
                        likes_count={article.like_count}
                        looks_count={article.look_count}
                        summary={article.summary}
                        tags={article.tags}
                        cover={article.cover}
                    />
                })
        }
    </div>
}
