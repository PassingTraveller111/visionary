import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {upsertColumn} from "@/server/columns/columns.service";
import type {UpdateColumnRequest} from "@/shared/api/columns";

export async function POST(req: NextRequest) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const data: UpdateColumnRequest = await req.json();
        const result = await upsertColumn(data, user.userId);
        if (!result) throw new ApiError(500, 'column_upsert_failed', 'Column upsert failed');
        return result;
    });
}
