"use client"

import styles from "./index.module.scss";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import moment from "moment";
import { useGetArticleList } from "@/hooks/articles/useArticles";
import {Empty} from "antd";
import UserCenterLayOut from "../../../../components/UserCenterLayout";


const ArticlePage = () => {
    const { userId } =  useParams();
    const { articleList, getArticleList } = useGetArticleList();
    useEffect(() => {
        getArticleList(Number(userId));
    }, [getArticleList, userId]);
    return <>
        <UserCenterLayOut>
            <div className={styles['articleList-container']}>
                {articleList.length === 0 && <Empty/>}
                {articleList.map((article) => {
                    return <div key={article.id} className={styles['articleList-item']}
                                onClick={() => {
                                    window.open('/reader/' + article.id);
                                }}
                    >
                        <div>
                            <div className={styles['article-title']}>{article.title}</div>
                            <div
                                className={styles['article-date']}>{moment(article.updated_time).format('YYYY-MM-DD HH:mm')}</div>
                        </div>
                    </div>
                })}
            </div>
        </UserCenterLayOut>
    </>
}

export default ArticlePage;


