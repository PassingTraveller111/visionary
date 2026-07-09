import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {insertArticleReadingRecord} from "@/server/article_reading_records/article_reading_records.service";

type RouteContext = {
    params: Promise<{
        articleId: string;
    }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const { articleId } = await context.params;
        const parsedArticleId = Number(articleId);
        if (!Number.isInteger(parsedArticleId) || parsedArticleId <= 0) {
            throw new ApiError(400, 'invalid_article_id', 'Invalid article id');
        }

        const data = await insertArticleReadingRecord(parsedArticleId, user.userId);
        if (!data) throw new ApiError(500, 'reading_record_insert_failed', 'Reading record insert failed');
        return data;
    });
}
