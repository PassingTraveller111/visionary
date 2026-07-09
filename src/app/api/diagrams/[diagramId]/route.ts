import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {getCurrentUser, requireUser} from "@/server/auth/currentUser";
import {deleteDiagramById, getDiagramById, getDiagramCoverById, renameDiagramById, upsertDiagram} from "@/server/diagrams/diagrams.service";
import type {UpdateDiagramRequest} from "@/shared/api/diagrams";

type RouteContext = {
    params: Promise<{
        diagramId: string;
    }>;
};

const parseDiagramId = async (context: RouteContext) => {
    const { diagramId } = await context.params;
    const parsedDiagramId = Number(diagramId);
    if (!Number.isInteger(parsedDiagramId) || parsedDiagramId <= 0) {
        throw new ApiError(400, 'invalid_diagram_id', 'Invalid diagram id');
    }
    return parsedDiagramId;
}

export async function GET(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const diagramId = await parseDiagramId(context);
        const mode = req.nextUrl.searchParams.get('mode');
        if (mode === 'cover') {
            const cover = await getDiagramCoverById(diagramId);
            if (!cover) throw new ApiError(404, 'diagram_not_found', 'Diagram not found');
            return cover;
        }

        const userId = getCurrentUser(req)?.userId ?? 0;
        const diagram = await getDiagramById(diagramId, userId);
        if (!diagram) throw new ApiError(404, 'diagram_not_found', 'Diagram not found');
        return diagram;
    });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const diagramId = await parseDiagramId(context);
        const data = await req.json() as Omit<UpdateDiagramRequest, 'id'> & { title?: string };
        const result = data.title && Object.keys(data).length === 1
            ? await renameDiagramById(data.title, diagramId, user.userId)
            : await upsertDiagram({ ...data, id: diagramId } as UpdateDiagramRequest, user.userId);
        if (!result) throw new ApiError(500, 'diagram_update_failed', 'Diagram update failed');
        return result;
    });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const diagramId = await parseDiagramId(context);
        const result = await deleteDiagramById(diagramId, user.userId);
        if (!result) throw new ApiError(500, 'diagram_delete_failed', 'Diagram delete failed');
        return result;
    });
}
