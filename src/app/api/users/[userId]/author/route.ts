import {apiHandler, ApiError} from "@/server/api/response";
import {getAuthorInfo} from "@/server/user/user.service";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(_req: Request, context: RouteContext) {
    return apiHandler(async () => {
        const { userId } = await context.params;
        const parsedUserId = Number(userId);
        if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) throw new ApiError(400, 'invalid_user_id', 'Invalid user id');
        const data = await getAuthorInfo(parsedUserId);
        if (!data) throw new ApiError(404, 'user_not_found', 'User not found');
        return data;
    });
}
