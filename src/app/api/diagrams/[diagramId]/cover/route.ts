import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {uploadDiagramCover} from "@/server/diagrams/diagrams.service";

type RouteContext = {
    params: Promise<{
        diagramId: string;
    }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const { diagramId } = await context.params;
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) throw new ApiError(400, 'missing_file', 'No file provided');
        return uploadDiagramCover(user.userId, diagramId, file);
    });
}
