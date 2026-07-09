import {NextRequest} from "next/server";
import {article} from "@/server/sql/article";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";

export async function GET(req: NextRequest) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const result = await article.getArticleToAddColumn(user.userId);
        if (!result) throw new ApiError(500, 'column_candidates_query_failed', 'Column candidates query failed');

        const [ rows ] = result;
        if (!Array.isArray(rows)) throw new ApiError(500, 'column_candidates_query_failed', 'Column candidates query failed');
        return rows;
    });
}
