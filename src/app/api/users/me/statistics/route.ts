import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {getUserStatistic} from "@/server/user/user.service";

export async function GET(req: NextRequest) {
    return apiHandler(async () => {
        const { userId } = requireUser(req);
        const data = await getUserStatistic(userId);
        if (!data) throw new ApiError(500, 'user_statistic_failed', 'User statistic failed');
        return data;
    });
}
