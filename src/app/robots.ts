import type {MetadataRoute} from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://visionaryblog.cn').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/creator/',
                '/editor/',
                '/reader/preview/',
                '/reader/review/',
                '/test',
                '/trackTest',
                '/userCenter/myData',
                '/userCenter/readHistory',
            ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
