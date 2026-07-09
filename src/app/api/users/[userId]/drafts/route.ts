import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {getDraftListByAuthorId} from "@/server/draft/draft.service";
import {requireUser} from "@/server/auth/currentUser";

type RouteContext = {
    params: Promise<{
        userId: string;
    }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const viewer = requireUser(req);
        const { userId } = await context.params;
        const parsedUserId = Number(userId);
        if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
            throw new ApiError(400, 'invalid_user_id', 'Invalid user id');
        }

        const drafts = await getDraftListByAuthorId(parsedUserId, viewer.userId);
        if (!drafts) throw new ApiError(403, 'forbidden', 'Forbidden');
        return drafts;
    });
}
