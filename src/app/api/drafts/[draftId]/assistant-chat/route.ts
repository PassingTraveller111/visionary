import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {getChatRecordByDraftId, insertChatRecord} from "@/server/assistant/assistant.service";

type RouteContext = {
    params: Promise<{
        draftId: string;
    }>;
};

const getDraftId = async (context: RouteContext) => {
    const { draftId } = await context.params;
    const parsedDraftId = Number(draftId);
    if (!Number.isInteger(parsedDraftId) || parsedDraftId <= 0) {
        throw new ApiError(400, 'invalid_draft_id', 'Invalid draft id');
    }
    return parsedDraftId;
}

export async function GET(_req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const draftId = await getDraftId(context);
        const data = await getChatRecordByDraftId(draftId);
        if (!data) throw new ApiError(404, 'assistant_chat_not_found', 'Assistant chat not found');
        return data;
    });
}

export async function POST(_req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const draftId = await getDraftId(context);
        const data = await insertChatRecord(draftId);
        if (!data) throw new ApiError(500, 'assistant_chat_insert_failed', 'Assistant chat insert failed');
        return data;
    });
}
