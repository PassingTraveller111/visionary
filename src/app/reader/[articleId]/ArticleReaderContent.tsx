import React from 'react';
import Link from 'next/link';
import MarkdownServer from '@/components/ReactMarkdown/server';
import type {ArticleDto} from '@/shared/api/article';
import {ReaderEditLink} from './ReaderClientShell';
import styles from './index.module.scss';

const ArticleReaderContent = ({article}: { article: ArticleDto }) => {
    return <article className={styles.readerContent}>
        <ReaderHeader article={article} />
        <MarkdownServer>{article.content}</MarkdownServer>
    </article>;
}

const ReaderHeader = ({article}: { article: ArticleDto }) => {
    return <div className={styles.readerHeaderContainer}>
        <div>
            <span className={styles.title}>{article.title}</span>
        </div>
        <div className={styles.introContainer}>
            <span className={styles.left}>
                <Link className={styles.authorName} href={`/userCenter/${article.author_id}/article`}>{article.author_nickname}</Link>
                <span className={styles.publishTime}>{formatDate(article.published_time)}</span>
                <span className={styles.view}>阅读 {article.look_count ?? 0}</span>
                {article.columns && article.columns.length > 0 && (
                    <span className={styles.columns}>
                        <span>专栏 </span>
                        {article.columns.map((column, index) => (
                            <React.Fragment key={column.column_id}>
                                {index > 0 && <span className={styles.columnSeparator}>/</span>}
                                <Link className={styles.columnLink} href={`/userCenter/Columns/${column.column_id}`}>{column.column_name}</Link>
                            </React.Fragment>
                        ))}
                    </span>
                )}
            </span>
            <ReaderEditLink authorId={article.author_id} draftId={article.draft_id} />
        </div>
    </div>;
};

const formatDate = (value?: string) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(value));
};

export default ArticleReaderContent;
