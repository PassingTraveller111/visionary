import {NextRequest} from "next/server";
import {getArticleCountByUserId} from "@/server/article/article.service";
import {apiHandler, ApiError} from "@/server/api/response";
import {getCurrentUser} from "@/server/auth/currentUser";

type RouteContext = {
    params: Promise<{
        userId: string;
    }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const { userId } = await context.params;
        const parsedUserId = Number(userId);
        if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
            throw new ApiError(400, 'invalid_user_id', 'Invalid user id');
        }

        const articleCounts = await getArticleCountByUserId(parsedUserId, getCurrentUser(req)?.userId ?? 0);
        if (articleCounts === null) throw new ApiError(500, 'article_count_failed', 'Article count failed');
        return { articleCounts };
    });
}
