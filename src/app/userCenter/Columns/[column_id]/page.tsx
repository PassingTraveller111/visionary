"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import {Empty} from "antd";
import {useGetArticleListByColumnId, useGetColumn} from "@/hooks/columns/useColumns";
import ArticleItem from "@/components/ArticleItem";
import {useEffect} from "react";
import {useParams} from "next/navigation";



const ColumnsPage = () => {
    const column_id = Number(useParams().column_id);
    const [articleList, getArticleList] = useGetArticleListByColumnId();
    const [column] = useGetColumn(column_id);
    useEffect(() => {
        getArticleList(column_id)
    }, [column_id, getArticleList])
    return <>
        <NavLayout>
            <div
                className={styles['column-container']}
            >
                <div className={styles['articleList-container']}>
                    <div className={styles.headerContainer}>
                        {column.column_name}
                    </div>
                    {articleList.length === 0 && <Empty/>}
                    {articleList.map((article) => {
                        return <ArticleItem
                            key={article.id}
                            title={article.title}
                            articleId={article.id}
                            cover={article.cover}
                            tags={article.tags}
                            summary={article.summary}
                            updateTime={article.updated_time}
                        />
                    })}
                </div>
            </div>
        </NavLayout>
    </>
}

export default ColumnsPage;