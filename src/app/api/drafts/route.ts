import {NextRequest} from "next/server";
import {apiHandler} from "@/server/api/response";
import {upsertDraft} from "@/server/draft/draft.service";
import type {UpdateDraftData} from "@/shared/api/draft";

export async function POST(req: NextRequest) {
    return apiHandler(async () => {
        const data: UpdateDraftData = await req.json();
        return upsertDraft(data);
    });
}
