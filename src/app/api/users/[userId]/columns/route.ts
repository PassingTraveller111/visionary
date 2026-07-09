import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {getColumnsByUserId} from "@/server/columns/columns.service";

type RouteContext = {
    params: Promise<{
        userId: string;
    }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const { userId } = await context.params;
        const parsedUserId = Number(userId);
        if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
            throw new ApiError(400, 'invalid_user_id', 'Invalid user id');
        }

        const columns = await getColumnsByUserId(parsedUserId);
        if (!columns) throw new ApiError(500, 'columns_query_failed', 'Columns query failed');
        return columns;
    });
}
