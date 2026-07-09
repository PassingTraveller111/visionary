import {apiHandler, ApiError} from "@/server/api/response";
import {getArticleCollectionsByUserId} from "@/server/article_collections/article_collections.service";

type RouteContext = {
    params: Promise<{
        userId: string;
    }>;
};

export async function GET(_req: Request, context: RouteContext) {
    return apiHandler(async () => {
        const { userId } = await context.params;
        const parsedUserId = Number(userId);
        if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
            throw new ApiError(400, 'invalid_user_id', 'Invalid user id');
        }

        const data = await getArticleCollectionsByUserId(parsedUserId);
        if (!data) throw new ApiError(500, 'collections_query_failed', 'Collections query failed');
        return data;
    });
}
