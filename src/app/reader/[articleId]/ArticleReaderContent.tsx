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
                <Link className={styles.authorName} href={`/userCenter/${article.author_id}`}>{article.author_nickname}</Link>
                <span className={styles.publishTime}>{formatDate(article.published_time)}</span>
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
