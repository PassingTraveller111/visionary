import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {getPublishedPublicArticleMeta} from "@/server/article/article.service";

type RouteContext = {
    params: Promise<{
        articleId: string;
    }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const { articleId } = await context.params;
        const parsedArticleId = Number(articleId);
        if (!Number.isInteger(parsedArticleId) || parsedArticleId <= 0) {
            throw new ApiError(400, 'invalid_article_id', 'Invalid article id');
        }

        const data = await getPublishedPublicArticleMeta(parsedArticleId);
        if (!data) throw new ApiError(404, 'article_not_found', 'Article not found');
        return data;
    });
}
