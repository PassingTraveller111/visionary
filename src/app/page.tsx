import type {Metadata} from "next";
import HomeClient from "./HomeClient";
import {getPublishedArticleList} from "@/server/article/article.service";
import type {ArticleQueryResult} from "@/shared/api/article";

const siteUrl = "https://visionaryblog.cn";
const homePageSize = 8;

export const revalidate = 300;

export const metadata: Metadata = {
    title: "创见博客 - 面向开发者的技术内容社区",
    description: "创见博客是面向开发者的技术内容分享与交流平台，聚合前端、后端、AI、工程实践等内容，帮助开发者沉淀经验、分享知识并持续成长。",
    alternates: {
        canonical: siteUrl,
    },
};

export default async function Home() {
    const result = await getPublishedArticleList(0, homePageSize, 'new');
    const initialArticles: ArticleQueryResult | undefined = result ? {
        items: result.rows,
        total: result.total,
        pageNum: 0,
        pageSize: homePageSize,
    } : undefined;

    return <HomeClient initialArticles={initialArticles} />;
}
