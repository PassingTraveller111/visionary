import type {Metadata} from "next";
import HomeClient from "./HomeClient";
import {getPublishedArticleList} from "@/server/article/article.service";
import {getPublicColumns} from "@/server/columns/columns.service";
import type {ArticleQueryResult} from "@/shared/api/article";

const siteUrl = "https://visionaryblog.cn";
const homePageSize = 8;

const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            name: "创见博客",
            url: siteUrl,
            logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/logo.svg`,
            },
            description: "面向开发者的技术内容分享与交流平台",
        },
        {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            url: siteUrl,
            name: "创见博客",
            description: "创见博客是面向开发者的技术内容分享与交流平台，聚合前端、后端、AI、工程实践等内容，帮助开发者沉淀经验、分享知识并持续成长。",
            inLanguage: "zh-CN",
            publisher: {
                "@id": `${siteUrl}/#organization`,
            },
        },
    ],
};

export const revalidate = 300;

export const metadata: Metadata = {
    title: "创见博客 - 面向开发者的技术内容社区",
    description: "创见博客是面向开发者的技术内容分享与交流平台，聚合前端、后端、AI、工程实践等内容，帮助开发者沉淀经验、分享知识并持续成长。",
    alternates: {
        canonical: siteUrl,
    },
};

export default async function Home() {
    const [articleResult, initialColumns] = await Promise.all([
        getPublishedArticleList(0, homePageSize, 'new'),
        getPublicColumns(0, homePageSize),
    ]);
    const initialArticles: ArticleQueryResult | undefined = articleResult ? {
        items: articleResult.rows,
        total: articleResult.total,
        pageNum: 0,
        pageSize: homePageSize,
    } : undefined;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(homeJsonLd).replace(/</g, '\\u003c')}}
            />
            <HomeClient initialArticles={initialArticles} initialColumns={initialColumns ?? undefined}/>
        </>
    );
}
