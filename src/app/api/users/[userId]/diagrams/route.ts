import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {getDiagramsByUserId} from "@/server/diagrams/diagrams.service";

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
        if (viewer.userId !== parsedUserId) throw new ApiError(403, 'forbidden', 'Forbidden');
        return getDiagramsByUserId(parsedUserId);
    });
}
