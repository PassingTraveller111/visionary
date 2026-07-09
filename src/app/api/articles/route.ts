import {NextRequest} from "next/server";
import {getArticleListByKeyWord, getPublishedArticleList} from "@/server/article/article.service";
import {apiHandler, ApiError} from "@/server/api/response";

const getPaginationParams = (req: NextRequest) => {
    const pageNum = Number(req.nextUrl.searchParams.get('pageNum') ?? 0);
    const pageSize = Number(req.nextUrl.searchParams.get('pageSize') ?? 8);

    if (!Number.isInteger(pageNum) || pageNum < 0) {
        throw new ApiError(400, 'invalid_page_num', 'Invalid page number');
    }
    if (!Number.isInteger(pageSize) || pageSize <= 0) {
        throw new ApiError(400, 'invalid_page_size', 'Invalid page size');
    }

    return { pageNum, pageSize };
}

export async function GET(req: NextRequest) {
    return apiHandler(async () => {
        const { pageNum, pageSize } = getPaginationParams(req);
        const keyword = req.nextUrl.searchParams.get('keyword')?.trim() ?? '';

        if (keyword) {
            const items = await getArticleListByKeyWord(keyword, pageNum, pageSize);
            if (!items) throw new ApiError(500, 'article_query_failed', 'Article query failed');
            return { items, pageNum, pageSize };
        }

        const result = await getPublishedArticleList(pageNum, pageSize);
        if (!result) throw new ApiError(500, 'article_query_failed', 'Article query failed');
        return {
            items: result.rows,
            total: result.total,
            pageNum,
            pageSize,
        };
    });
}
