import {NextRequest} from "next/server";
import {getArticleListByColumnId} from "@/server/article/article.service";
import {apiHandler, ApiError} from "@/server/api/response";
import {getCurrentUser} from "@/server/auth/currentUser";
import {updateColumnArticleList} from "@/server/columns/columns.service";
import type {UpdateColumnArticleListRequest} from "@/shared/api/columns";

type RouteContext = {
    params: Promise<{
        columnId: string;
    }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const { columnId } = await context.params;
        const parsedColumnId = Number(columnId);
        if (!Number.isInteger(parsedColumnId) || parsedColumnId <= 0) {
            throw new ApiError(400, 'invalid_column_id', 'Invalid column id');
        }

        const items = await getArticleListByColumnId(parsedColumnId, getCurrentUser(req)?.userId ?? 0);
        if (!items) throw new ApiError(500, 'column_articles_query_failed', 'Column articles query failed');
        return items;
    });
}

export async function PUT(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const { columnId } = await context.params;
        const parsedColumnId = Number(columnId);
        if (!Number.isInteger(parsedColumnId) || parsedColumnId <= 0) {
            throw new ApiError(400, 'invalid_column_id', 'Invalid column id');
        }

        const data: Pick<UpdateColumnArticleListRequest, 'article_ids'> = await req.json();
        await updateColumnArticleList(parsedColumnId, data.article_ids);
        return { updated: true };
    });
}
