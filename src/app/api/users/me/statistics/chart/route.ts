import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {getUserStatisticChart} from "@/server/user/user.service";

export async function GET(req: NextRequest) {
    return apiHandler(async () => {
        const { userId } = requireUser(req);
        const startDate = req.nextUrl.searchParams.get('startDate') ?? '';
        const endDate = req.nextUrl.searchParams.get('endDate') ?? '';
        const data = await getUserStatisticChart(userId, startDate, endDate);
        if (!data) throw new ApiError(500, 'user_statistic_chart_failed', 'User statistic chart failed');
        return data;
    });
}
