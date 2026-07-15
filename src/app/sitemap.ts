import type {MetadataRoute} from 'next';
import {getPublishedPublicArticleSitemapItems} from '@/server/article/article.service';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://visionaryblog.cn').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const articles = await getPublishedPublicArticleSitemapItems();

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
    ];
}
