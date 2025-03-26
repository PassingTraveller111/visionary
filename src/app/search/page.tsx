"use client"
import NavLayout from "@/components/NavLayout";
import { useGetPublishedArticleListByKeyWord } from "@/hooks/articles/useArticles";
import {Suspense, useEffect} from "react";
import styles from './index.module.scss';
import moment from "moment";
import {useRouter, useSearchParams} from "next/navigation";
import {Empty} from "antd";
import ArticleItem from "@/components/ArticleItem";

function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initKeyword = searchParams.get('keyword');
    const { articleList, getArticleList, loadMore, messageContext } = useGetPublishedArticleListByKeyWord();
    useEffect(() => {
        getArticleList({keyword: initKeyword ?? '', isInit: true });
    }, [getArticleList, initKeyword]);
    return (<NavLayout>
                {messageContext}
                <div
                    className={styles.container}
                    onScroll={(e) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        const { scrollTop, clientHeight, scrollHeight } = e.target;
                        if (scrollTop + clientHeight >= scrollHeight) {
                            loadMore();
                        }
                    }}
                >
                    <div
                        className={styles.articleList}
                    >
                        {articleList.length === 0 && <Empty />}
                        {
                            articleList.map((article) => {
                                return <ArticleItem
                                    key={article.id}
                                    title={article.title}
                                    articleId={article.id}
                                    summary={article.summary}
                                    tags={article.tags}
                                    author={article.author_nickname}
                                    updateTime={article.updated_time}
                                    likes_count={article.like_count}
                                    looks_count={article.look_count}
                                    cover={article.cover}
                                />
                            })
                        }
                    </div>
                </div>
            </NavLayout>
    );
}

const SearchArticlePage = () =>{
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchPage />
        </Suspense>
    )
}

export default SearchArticlePage;