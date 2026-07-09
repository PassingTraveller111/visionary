import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {deleteDraftById, getDraftById, upsertDraft} from "@/server/draft/draft.service";
import type {UpdateDraftData} from "@/shared/api/draft";

type RouteContext = {
    params: Promise<{
        draftId: string;
    }>;
};

const parseDraftId = async (context: RouteContext) => {
    const { draftId } = await context.params;
    const parsedDraftId = Number(draftId);
    if (!Number.isInteger(parsedDraftId) || parsedDraftId <= 0) {
        throw new ApiError(400, 'invalid_draft_id', 'Invalid draft id');
    }
    return parsedDraftId;
}

export async function GET(_req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const draftId = await parseDraftId(context);
        const draft = await getDraftById(draftId);
        if (!draft) throw new ApiError(404, 'draft_not_found', 'Draft not found');
        return draft;
    });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const draftId = await parseDraftId(context);
        const data = await req.json() as Omit<UpdateDraftData, 'draftId'>;
        return upsertDraft({ ...data, draftId });
    });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const draftId = await parseDraftId(context);
        return deleteDraftById(draftId);
    });
}
