import type {MetadataRoute} from 'next';
import {getPublishedPublicArticleSitemapItems} from '@/server/article/article.service';
import {getPublicColumnSitemapItems} from '@/server/columns/columns.service';

export const revalidate = 86400;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://visionaryblog.cn').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [articles, columns] = await Promise.all([
        getPublishedPublicArticleSitemapItems(),
        getPublicColumnSitemapItems(),
    ]);

    return [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${siteUrl}/userAgreement`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        ...articles.map(article => ({
            url: `${siteUrl}/reader/${article.id}`,
            lastModified: article.updated_time ? new Date(article.updated_time) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        })),
        ...columns.map(column => ({
            url: `${siteUrl}/userCenter/Columns/${column.column_id}`,
            lastModified: column.latest_article_updated_at ? new Date(column.latest_article_updated_at) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        })),
    ];
}
