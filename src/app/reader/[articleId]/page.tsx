import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import NavLayout from '@/components/NavLayout';
import {getPublishedPublicArticle} from '@/server/article/article.service';
import ArticleReaderContent from './ArticleReaderContent';
import ReaderClientShell from './ReaderClientShell';

export const dynamic = 'force-static';
export const revalidate = false;

const siteUrl = 'https://visionaryblog.cn';

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
    return getPublishedPublicArticle(articleId);
};

export async function generateMetadata(props: ReaderPageProps): Promise<Metadata> {
    const {articleId: articleIdParam} = await props.params;
    const article = await getPublicArticle(parseArticleId(articleIdParam));
    if (!article) return {};

    return {
        title: article.title,
        description: article.summary || article.content.slice(0, 120),
        alternates: {
            canonical: `${siteUrl}/reader/${article.id}`,
        },
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
            <ArticleReaderContent article={article} />
        </ReaderClientShell>
    </NavLayout>;
};

export default ReaderPage;
