import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {getArticleIsLike, setArticleIsLike} from "@/server/article_likes/article_likes.service";
import type {SetArticleLikeRequest} from "@/shared/api/article_likes";

type RouteContext = {
    params: Promise<{
        articleId: string;
    }>;
};

const getArticleId = async (context: RouteContext) => {
    const { articleId } = await context.params;
    const parsedArticleId = Number(articleId);
    if (!Number.isInteger(parsedArticleId) || parsedArticleId <= 0) {
        throw new ApiError(400, 'invalid_article_id', 'Invalid article id');
    }
    return parsedArticleId;
}

export async function GET(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const articleId = await getArticleId(context);
        const data = await getArticleIsLike(user.userId, articleId);
        if (!data) throw new ApiError(500, 'like_query_failed', 'Like query failed');
        return data;
    });
}

export async function PUT(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const articleId = await getArticleId(context);
        const { isLike }: SetArticleLikeRequest = await req.json();
        const data = await setArticleIsLike(user.userId, articleId, isLike);
        if (!data) throw new ApiError(500, 'like_update_failed', 'Like update failed');
        return data;
    });
}
