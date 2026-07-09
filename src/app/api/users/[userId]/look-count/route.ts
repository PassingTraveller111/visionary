import {apiHandler, ApiError} from "@/server/api/response";
import {getLookCountsByUserId} from "@/server/article_reading_records/article_reading_records.service";

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

        const data = await getLookCountsByUserId(parsedUserId);
        if (!data) throw new ApiError(500, 'look_count_failed', 'Look count failed');
        return data;
    });
}
