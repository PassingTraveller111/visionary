import {cookies} from 'next/headers';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import NavLayout from '@/components/NavLayout';
import {getArticle} from '@/server/article/article.service';
import {verifyToken} from '@/utils/auth';
import ArticleReaderContent from '../../[articleId]/ArticleReaderContent';
import ReaderClientShell from '../../[articleId]/ReaderClientShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ReaderPreviewPageProps = {
    params: Promise<{
        articleId: string;
    }>;
};

const parseArticleId = (value: string) => {
    const articleId = Number(value);
    return Number.isInteger(articleId) && articleId > 0 ? articleId : 0;
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

const getPreviewArticle = async (articleId: number) => {
    if (!articleId) return null;
    return getArticle(articleId, await getViewerUserId());
};

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: '文章预览',
        robots: {
            index: false,
            follow: false,
        },
    };
}

const ReaderPreviewPage = async (props: ReaderPreviewPageProps) => {
    const {articleId: articleIdParam} = await props.params;
    const article = await getPreviewArticle(parseArticleId(articleIdParam));

    if (!article) notFound();

    return <NavLayout>
        <ReaderClientShell articleId={article.id} authorId={article.author_id} markdown={article.content} isPreview>
            <ArticleReaderContent article={article} />
        </ReaderClientShell>
    </NavLayout>;
};

export default ReaderPreviewPage;
