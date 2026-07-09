import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {publishDraftById} from "@/server/draft/draft.service";

type RouteContext = {
    params: Promise<{
        draftId: string;
    }>;
};

export async function POST(_req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const { draftId } = await context.params;
        const parsedDraftId = Number(draftId);
        if (!Number.isInteger(parsedDraftId) || parsedDraftId <= 0) {
            throw new ApiError(400, 'invalid_draft_id', 'Invalid draft id');
        }

        const result = await publishDraftById(parsedDraftId);
        if (!result) throw new ApiError(404, 'draft_not_found', 'Draft not found');
        return result;
    });
}
