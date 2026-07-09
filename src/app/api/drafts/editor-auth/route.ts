import {NextRequest} from "next/server";
import {apiHandler} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {canEditDraft} from "@/server/draft/draft.service";
import type {DraftEditorAuthData} from "@/shared/api/draft";

export async function POST(req: NextRequest) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const data: DraftEditorAuthData = await req.json();
        return { auth: await canEditDraft(data.draftId, user.userId) };
    });
}
