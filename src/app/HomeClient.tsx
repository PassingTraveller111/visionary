"use client"
import NavLayout from "@/components/NavLayout";
import {useGetArticleCountByUserId, useGetPublishedArticleList} from "@/hooks/articles/useArticles";
import React, {useEffect, useRef, useState} from "react";
import styles from './index.module.scss';
import { useRouter } from "next/navigation";
import {Button, Skeleton, Tabs, TabsProps} from "antd";
import useMessage from "antd/es/message/useMessage";
import Image from "next/image";
import {useAppSelector} from "@/store";
import {apiClient} from "@/clientApi";
import type {QuoteDto} from "@/shared/api/quotes";
import type {ArticleQueryResult, getArticleCountByUserIdResponse} from "@/shared/api/article";
import {
    getArticleLikeCountByUserIdResponseType
} from "@/shared/api/article_likes";
import {useGetLookCountByUserId} from "@/hooks/article_reading_records/useArticleReadingRecords";
import {useGetArticleLikeCountByUserId} from "@/hooks/article_likes/useArticleLikes";
import ArticleItem from "@/components/ArticleItem";
import type {ApiResponse} from "@/shared/api/response";



type tabKeysType = 'new' | 'hot';

export default function HomeClient({ initialArticles }: { initialArticles?: ArticleQueryResult }) {
    const [currentTab, setCurrentTab] = useState<tabKeysType>('new');
    const [showUserBar, setShowUserBar] = useState(false);
    const didUseInitialArticlesRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const { articleList, getPublishedArticleList, loadMore, messageContext, isInitialLoading, isLoadingMore, hasMore, error } = useGetPublishedArticleList(initialArticles);
    const showLeftBar = showUserBar;
    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 769px)');
        const syncShowUserBar = () => setShowUserBar(mediaQuery.matches);
        syncShowUserBar();
        mediaQuery.addEventListener('change', syncShowUserBar);
        return () => mediaQuery.removeEventListener('change', syncShowUserBar);
    }, []);
    useEffect(() => {
        if (!didUseInitialArticlesRef.current && currentTab === 'new' && initialArticles) {
            didUseInitialArticlesRef.current = true;
            return;
        }
        void getPublishedArticleList({ isInit: true, sort: currentTab });
    }, [getPublishedArticleList, currentTab, initialArticles]);
    useEffect(() => {
        const container = containerRef.current;
        const sentinel = loadMoreRef.current;
        if (!container || !sentinel) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) loadMore(currentTab);
        }, {
            root: container,
            rootMargin: '120px 0px',
        });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [currentTab, loadMore]);
    const items: TabsProps['items'] = [
        {
            key: 'new',
            label: <span
                className={styles.tabLabel}
            >最新</span>,
            children: <ArticleList
                articleList={articleList}
                isInitialLoading={isInitialLoading}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                error={error}
                onRetry={() => void getPublishedArticleList({ isInit: true, sort: currentTab })}
                loadMoreRef={loadMoreRef}
            />,
        },
        {
            key: 'hot',
            label: <span
                className={styles.tabLabel}
            >热门</span>,
            children: <ArticleList
                articleList={articleList}
                isInitialLoading={isInitialLoading}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                error={error}
                onRetry={() => void getPublishedArticleList({ isInit: true, sort: currentTab })}
                loadMoreRef={loadMoreRef}
            />,
        },
    ];
    return (
        <div>
            <NavLayout>
            {messageContext}
                <div
                    ref={containerRef}
                    className={styles.container}
                >
                    <Tabs
                        activeKey={currentTab}
                        className={`${styles.tabContainer} ${!showLeftBar ? styles.tabContainerFull : ''}`}
                        items={items}
                        onChange={(tabKey) => {
                            setCurrentTab(tabKey as tabKeysType);
                        }}
                    />
                    {showLeftBar && <div className={styles.leftBar}>
                        {userInfo.login && <UserBar/>}
                        <CliRecommendBar />
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

const CliRecommendBar = () => {
    const [messageApi, contextHolder] = useMessage();
    const installCommand = 'npm install -g visionary-cli';

    const copyInstallCommand = async () => {
        try {
            await navigator.clipboard.writeText(installCommand);
            messageApi.success('复制成功');
        } catch {
            messageApi.error('复制失败');
        }
    };

    return <div className={styles.cliRecommendBar}>
        {contextHolder}
        <div className={styles.cliRecommendTitle}>用 CLI 发布更高效</div>
        <div className={styles.cliRecommendDesc}>安装 Visionary CLI 后，可以在终端中创建草稿、上传 Markdown 并发布文章。</div>
        <div className={styles.cliInstallCommand}>
            <code>{installCommand}</code>
            <button type="button" className={styles.cliCopyButton} onClick={copyInstallCommand}>复制</button>
        </div>
    </div>;
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
    articleList: ArticleListItemType[];
    isInitialLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    error: string;
    onRetry: () => void;
    loadMoreRef: React.Ref<HTMLDivElement>;
}) => {
    const {articleList, isInitialLoading, isLoadingMore, hasMore, error, onRetry, loadMoreRef} = props;
    if (isInitialLoading) {
        return <div className={styles.articleList}>
            <Skeleton active/>
        </div>
    }

    if (error) {
        return <div className={styles.articleList}>
            <div className={styles.articleState}>
                <div>{error}</div>
                <Button type="primary" onClick={onRetry}>重试</Button>
            </div>
        </div>
    }

    if (articleList.length === 0) {
        return <div className={styles.articleList}>
            <div className={styles.articleState}>暂无文章</div>
        </div>
    }

    return <div
        className={styles.articleList}
    >
        {
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
        <div ref={loadMoreRef} className={styles.loadMoreTrigger}/>
        {isLoadingMore && <Skeleton active paragraph={{rows: 1}}/>}
        {!hasMore && <div className={styles.articleState}>没有更多数据了</div>}
    </div>
}
