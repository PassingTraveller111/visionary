import React from 'react';
import Link from 'next/link';
import {cookies} from 'next/headers';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import NavLayout from '@/components/NavLayout';
import MarkdownServer from '@/components/ReactMarkdown/server';
import {getArticle} from '@/server/article/article.service';
import type {ArticleDto} from '@/shared/api/article';
import {verifyToken} from '@/utils/auth';
import ReaderClientShell, {ReaderEditLink} from './ReaderClientShell';
import styles from './index.module.scss';

type ReaderPageProps = {
    params: Promise<{
        articleId: string;
    }>;
};

const parseArticleId = (value: string) => {
    const articleId = Number(value);
    return Number.isInteger(articleId) && articleId > 0 ? articleId : 0;
};

const getPublicArticle = async (articleId: number) => {
    if (!articleId) return null;
    return getArticle(articleId, await getViewerUserId());
};

const getViewerUserId = async () => {
    const token = (await cookies()).get('token')?.value;
    if (!token) return 0;

    try {
        return verifyToken(token).userId;
    } catch {
        return 0;
    }
};

export async function generateMetadata(props: ReaderPageProps): Promise<Metadata> {
    const {articleId: articleIdParam} = await props.params;
    const article = await getPublicArticle(parseArticleId(articleIdParam));
    if (!article) return {};

    return {
        title: article.title,
        description: article.summary || article.content.slice(0, 120),
        openGraph: {
            title: article.title,
            description: article.summary || article.content.slice(0, 120),
            images: article.cover ? [article.cover] : undefined,
            type: 'article',
        },
    };
}

const ReaderPage = async (props: ReaderPageProps) => {
    const {articleId: articleIdParam} = await props.params;
    const articleId = parseArticleId(articleIdParam);
    const article = await getPublicArticle(articleId);

    if (!article) notFound();

    return <NavLayout>
        <ReaderClientShell articleId={article.id} authorId={article.author_id} markdown={article.content}>
            <article className={styles.readerContent}>
                <ReaderHeader article={article} />
                <MarkdownServer>{article.content}</MarkdownServer>
            </article>
        </ReaderClientShell>
    </NavLayout>;
};

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

export default ReaderPage;
