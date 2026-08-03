import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {getPublicColumns, upsertColumn} from "@/server/columns/columns.service";
import type {UpdateColumnRequest} from "@/shared/api/columns";

const MAX_PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
    return apiHandler(async () => {
        const pageNum = Number(req.nextUrl.searchParams.get('pageNum') ?? 0);
        const pageSize = Number(req.nextUrl.searchParams.get('pageSize') ?? 8);

        if (!Number.isInteger(pageNum) || pageNum < 0) {
            throw new ApiError(400, 'invalid_page_num', 'Invalid page number');
        }
        if (!Number.isInteger(pageSize) || pageSize <= 0 || pageSize > MAX_PAGE_SIZE) {
            throw new ApiError(400, 'invalid_page_size', 'Invalid page size');
        }

        const result = await getPublicColumns(pageNum, pageSize);
        if (!result) throw new ApiError(500, 'columns_query_failed', 'Columns query failed');
        return result;
    });
}

export async function POST(req: NextRequest) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const data: UpdateColumnRequest = await req.json();
        const result = await upsertColumn(data, user.userId);
        if (!result) throw new ApiError(500, 'column_upsert_failed', 'Column upsert failed');
        return result;
    });
}
