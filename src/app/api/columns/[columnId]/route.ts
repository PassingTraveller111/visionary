import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {deleteColumnById, getColumnById, upsertColumn} from "@/server/columns/columns.service";
import type {UpdateColumnRequest} from "@/shared/api/columns";

type RouteContext = {
    params: Promise<{
        columnId: string;
    }>;
};

const parseColumnId = async (context: RouteContext) => {
    const { columnId } = await context.params;
    const parsedColumnId = Number(columnId);
    if (!Number.isInteger(parsedColumnId) || parsedColumnId <= 0) {
        throw new ApiError(400, 'invalid_column_id', 'Invalid column id');
    }
    return parsedColumnId;
}

export async function GET(_req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const columnId = await parseColumnId(context);
        const column = await getColumnById(columnId);
        if (!column) throw new ApiError(404, 'column_not_found', 'Column not found');
        return column;
    });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const columnId = await parseColumnId(context);
        const data = await req.json() as Omit<UpdateColumnRequest, 'column_id'>;
        const result = await upsertColumn({ ...data, column_id: columnId }, user.userId);
        if (!result) throw new ApiError(500, 'column_update_failed', 'Column update failed');
        return result;
    });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const columnId = await parseColumnId(context);
        const result = await deleteColumnById(columnId, user.userId);
        if (!result) throw new ApiError(500, 'column_delete_failed', 'Column delete failed');
        return result;
    });
}
