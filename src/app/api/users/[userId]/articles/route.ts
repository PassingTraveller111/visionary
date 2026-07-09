import {NextRequest} from "next/server";
import {getArticleList} from "@/server/article/article.service";
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

        return getArticleList(parsedUserId, getCurrentUser(req)?.userId ?? 0);
    });
}
