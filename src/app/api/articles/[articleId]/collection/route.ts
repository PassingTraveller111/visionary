import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {getArticleIsCollected, setArticleIsCollected} from "@/server/article_collections/article_collections.service";
import type {SetArticleCollectionRequest} from "@/shared/api/article_collections";

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
        const data = await getArticleIsCollected(user.userId, articleId);
        if (!data) throw new ApiError(500, 'collection_query_failed', 'Collection query failed');
        return data;
    });
}

export async function PUT(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const articleId = await getArticleId(context);
        const { isCollected }: SetArticleCollectionRequest = await req.json();
        const data = await setArticleIsCollected(user.userId, articleId, isCollected);
        if (!data) throw new ApiError(500, 'collection_update_failed', 'Collection update failed');
        return data;
    });
}
