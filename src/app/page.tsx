"use client"
import NavLayout from "@/components/NavLayout";
import { useGetPublishedArticleList } from "@/hooks/articles/useArticles";
import { useEffect } from "react";
import styles from './index.module.scss';
import moment from "moment";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const { articleList, getPublishedArticleList, loadMore, messageContext } = useGetPublishedArticleList();
    useEffect(() => {
        getPublishedArticleList();
    }, []);
   return (
        <div>
            <NavLayout>
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
                        {
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
                                    </div>
                                </div>
                            })
                        }
                    </div>
                </div>
            </NavLayout>
        </div>
   );
}