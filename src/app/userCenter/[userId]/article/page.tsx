"use client"
import styles from "./index.module.scss";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useGetArticleList } from "@/hooks/articles/useArticles";
import {Empty} from "antd";
import ArticleItem from "@/components/ArticleItem";


const ArticlePage = () => {
    const { userId } =  useParams();
    const { articleList, getArticleList } = useGetArticleList();
    useEffect(() => {
        getArticleList(Number(userId));
    }, [getArticleList, userId]);
    return <>
        <div className={styles['articleList-container']}>
            {articleList.length === 0 && <Empty/>}
            {articleList.map((article) => {
                return <ArticleItem
                    key={article.id}
                    title={article.title}
                    articleId={article.id}
                    updateTime={article.updated_time}
                />
            })}
        </div>
    </>
}

export default ArticlePage;


