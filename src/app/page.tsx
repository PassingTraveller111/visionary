"use client"
import NavLayout from "@/components/NavLayout";
import { useGetPublishedArticleList } from "@/hooks/articles/useArticles";
import React, {useEffect, useState} from "react";
import styles from './index.module.scss';
import moment from "moment";
import { useRouter } from "next/navigation";
import {IconFont} from "@/components/IconFont";
import {Skeleton, Tabs, TabsProps} from "antd";
import Image from "next/image";
import {useAppSelector} from "@/store";
import {apiClient, apiList} from "@/clientApi";
import {getQuoteRandomResponseType} from "@/app/api/protected/quotes/getQuoteRandom/route";
import {getArticleCountByUserIdResponse} from "@/app/api/protected/article/getArticleCountByUserId/route";

type tabKeysType = 'new' | 'hot';

export default function Home() {
    const [currentTab, setCurrentTab] = useState<tabKeysType>('new');
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
                        className={styles.tabContainer}
                        items={items}
                        onChange={(tabKey) => {
                            setCurrentTab(tabKey as tabKeysType);
                        }}
                    />
                    <div className={styles.leftBar}>
                        <UserBar/>
                    </div>
                </div>
            </NavLayout>
        </div>
    );
}


const UserBar = () => {
    const router = useRouter();
    const [quote, setQuote] = useState('');
    const [articleCount, setArticleCount] = useState(0);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    useEffect(() => {
        apiClient(apiList.get.protected.quotes.getQuoteRandom).then((res: getQuoteRandomResponseType) => {
            if(res.msg === 'success') setQuote(res.data.quote_text);
        });

    }, []);
    useEffect(() => {
        if(userInfo.id === 0) return;
        apiClient(apiList.post.protected.article.getArticleCountByUserId, {
            method: 'POST',
            body: JSON.stringify({
                userId: userInfo.id,
            })
        }).then((res: getArticleCountByUserIdResponse) => {
            if(res.msg === 'success') setArticleCount(res.data.articleCounts);
        })
    }, [userInfo.id]);
    return <div className={styles.userBar}>
        <div className={styles.top}>
            <div className={styles.avatar}>
                {userInfo?.profile && <Image src={userInfo.profile} width={60} height={60} alt='avatar'/>}
            </div>
            <div className={styles.userInfo}>
                <div className={styles.nickName}
                     onClick={() => {
                         router.push('/profile/' + userInfo);
                     }}
                >{userInfo?.nick_name}</div>
                <div>{userInfo?.email}</div>
            </div>
        </div>
        {quote && <div className={styles.center}>
            {quote}
        </div>}
        <div className={styles.bottom}>
            <span className={styles.bottomItem}>
                <div>{articleCount}</div>
                <div>文章</div>
            </span>
            <span className={styles.bottomItem}>
                <div>100</div>
                <div>阅读</div>
            </span>
            <span className={styles.bottomItem}>
                <div>1</div>
                <div>点赞</div>
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
}

const ArticleList = (props: {
    articleList: ArticleListItemType[] }) => {
    const {articleList} = props;
    const router = useRouter();
    return <div
        className={styles.articleList}
    >
        {
            articleList.length === 0 ?
                <Skeleton active/>
                :
                articleList.map((article) => {
                    return <div
                        key={article.id}
                        className={styles.articleItem}
                        onClick={() => {
                            router.push('/reader/' + article.id);
                        }}
                    >
                        <div className={styles.title}>{article.title}</div>
                        <div className={styles.summary}>{article.summary}</div>
                        <div className={styles.itemBottom}>
                            <div className={styles.author}>{article.author_nickname}</div>
                            <div className={styles.date}>{moment(article.updated_time).format('YYYY-MM-DD')}</div>
                            <div className={styles.like}><IconFont
                                type='icon-like'/><span>{article.like_count}</span></div>
                        </div>
                    </div>
                })
        }
    </div>
}
