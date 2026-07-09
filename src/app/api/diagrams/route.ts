import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {upsertDiagram} from "@/server/diagrams/diagrams.service";
import type {UpdateDiagramRequest} from "@/shared/api/diagrams";

export async function POST(req: NextRequest) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const data: UpdateDiagramRequest = await req.json();
        const result = await upsertDiagram(data, user.userId);
        if (!result) throw new ApiError(500, 'diagram_upsert_failed', 'Diagram upsert failed');
        return result;
    });
}
