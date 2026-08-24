import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import NavLayout from '@/components/NavLayout';
import {getPublishedArticleList, getPublishedPublicArticle} from '@/server/article/article.service';
import type {ArticleDto, PublishedArticleItemDto} from '@/shared/api/article';
import ArticleReaderContent from './ArticleReaderContent';
import ReaderClientShell, {type RelatedArticleItem} from './ReaderClientShell';

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

const toAbsoluteUrl = (value: string) => {
    if (/^https?:\/\//i.test(value)) return value;
    return `${siteUrl}/${value.replace(/^\//, '')}`;
};

const toIsoDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const getArticleJsonLd = (article: ArticleDto) => {
    const articleUrl = `${siteUrl}/reader/${article.id}`;
    const description = article.summary || article.content.slice(0, 120);

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BlogPosting',
                '@id': `${articleUrl}/#article`,
                headline: article.title,
                description,
                url: articleUrl,
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': articleUrl,
                },
                image: article.cover ? toAbsoluteUrl(article.cover) : undefined,
                datePublished: toIsoDate(article.published_time),
                dateModified: toIsoDate(article.updated_time),
                inLanguage: 'zh-CN',
                keywords: article.tags?.length ? article.tags : undefined,
                author: {
                    '@type': 'Person',
                    '@id': `${siteUrl}/userCenter/${article.author_id}/article#person`,
                    name: article.author_nickname,
                    url: `${siteUrl}/userCenter/${article.author_id}/article`,
                },
                publisher: {
                    '@type': 'Organization',
                    '@id': `${siteUrl}/#organization`,
                    name: '创见博客',
                    logo: {
                        '@type': 'ImageObject',
                        url: `${siteUrl}/logo.svg`,
                    },
                },
                isPartOf: {
                    '@type': 'WebSite',
                    '@id': `${siteUrl}/#website`,
                    name: '创见博客',
                    url: siteUrl,
                },
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${articleUrl}/#breadcrumb`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: '首页',
                        item: siteUrl,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: article.title,
                        item: articleUrl,
                    },
                ],
            },
        ],
    };
};

const getRelatedArticles = (article: ArticleDto, candidates: PublishedArticleItemDto[]): RelatedArticleItem[] => {
    const currentTags = new Set(article.tags ?? []);

    return candidates
        .filter(candidate => candidate.id !== article.id)
        .map(candidate => ({
            article: candidate,
            score: (candidate.tags ?? []).filter(tag => currentTags.has(tag)).length,
        }))
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.article.updated_time).getTime() - new Date(a.article.updated_time).getTime();
        })
        .slice(0, 3)
        .map(({article: relatedArticle}) => ({
            id: relatedArticle.id,
            title: relatedArticle.title,
            summary: relatedArticle.summary,
            updated_time: relatedArticle.updated_time,
        }));
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
    const [article, publishedArticleResult] = await Promise.all([
        getPublicArticle(articleId),
        getPublishedArticleList(0, 12, 'new'),
    ]);

    if (!article) notFound();

    const relatedArticles = getRelatedArticles(article, publishedArticleResult?.rows ?? []);
    const jsonLd = getArticleJsonLd(article);

    return <NavLayout>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')}}
        />
        <ReaderClientShell articleId={article.id} authorId={article.author_id} markdown={article.content} relatedArticles={relatedArticles}>
            <ArticleReaderContent article={article} />
        </ReaderClientShell>
    </NavLayout>;
};

export default ReaderPage;
