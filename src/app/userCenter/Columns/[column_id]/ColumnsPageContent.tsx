import {Empty} from "antd";
import ArticleItem from "@/components/ArticleItem";
import type {ColumnArticleItemDto} from "@/shared/api/article";
import type {ColumnDto} from "@/shared/api/columns";
import styles from "./index.module.scss";

type ColumnsPageContentProps = {
    column: ColumnDto;
    articleList: ColumnArticleItemDto[];
};

const ColumnsPageContent = ({column, articleList}: ColumnsPageContentProps) => {
    return <div className={styles["column-container"]}>
        <div className={styles["articleList-container"]}>
            <header className={styles.headerContainer}>
                <h1 className={styles.title}>{column.column_name}</h1>
                {column.description && <p className={styles.description}>{column.description}</p>}
            </header>
            {articleList.length === 0 && <Empty/>}
            {articleList.map(article => <ArticleItem
                key={article.id}
                title={article.title}
                articleId={article.id}
                cover={article.cover}
                tags={article.tags}
                summary={article.summary}
                updateTime={article.updated_time}
            />)}
        </div>
    </div>;
};

export default ColumnsPageContent;
