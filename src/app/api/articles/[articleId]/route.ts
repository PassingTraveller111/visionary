import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {getCurrentUser} from "@/server/auth/currentUser";
import {deleteArticleById, getArticle} from "@/server/article/article.service";

type RouteContext = {
    params: Promise<{
        articleId: string;
    }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const { articleId } = await context.params;
        const parsedArticleId = Number(articleId);
        if (!Number.isInteger(parsedArticleId) || parsedArticleId <= 0) {
            throw new ApiError(400, 'invalid_article_id', 'Invalid article id');
        }

        const data = await getArticle(parsedArticleId, getCurrentUser(req)?.userId ?? 0);
        if (!data) throw new ApiError(404, 'article_not_found', 'Article not found');
        return data;
    });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const { articleId } = await context.params;
        const parsedArticleId = Number(articleId);
        if (!Number.isInteger(parsedArticleId) || parsedArticleId <= 0) {
            throw new ApiError(400, 'invalid_article_id', 'Invalid article id');
        }

        return deleteArticleById(parsedArticleId);
    });
}
