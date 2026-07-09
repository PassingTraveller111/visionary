import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {getArticleReadingRecordsByUserId} from "@/server/article_reading_records/article_reading_records.service";

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

        const pageNum = Number(req.nextUrl.searchParams.get('pageNum') ?? 0);
        const pageSize = Number(req.nextUrl.searchParams.get('pageSize') ?? 8);
        if (!Number.isInteger(pageNum) || pageNum < 0) throw new ApiError(400, 'invalid_page_num', 'Invalid page number');
        if (!Number.isInteger(pageSize) || pageSize <= 0) throw new ApiError(400, 'invalid_page_size', 'Invalid page size');

        const data = await getArticleReadingRecordsByUserId(parsedUserId, pageNum, pageSize);
        if (!data) throw new ApiError(500, 'reading_records_query_failed', 'Reading records query failed');
        return data;
    });
}
