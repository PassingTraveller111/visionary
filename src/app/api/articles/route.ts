import {NextRequest} from "next/server";
import {getArticleListByKeyWord, getPublishedArticleList} from "@/server/article/article.service";
import {apiHandler, ApiError} from "@/server/api/response";
import type {ArticleListSort} from "@/shared/api/article";

const MAX_PAGE_SIZE = 50;

const getPaginationParams = (req: NextRequest) => {
    const pageNum = Number(req.nextUrl.searchParams.get('pageNum') ?? 0);
    const pageSize = Number(req.nextUrl.searchParams.get('pageSize') ?? 8);

    if (!Number.isInteger(pageNum) || pageNum < 0) {
        throw new ApiError(400, 'invalid_page_num', 'Invalid page number');
    }
    if (!Number.isInteger(pageSize) || pageSize <= 0 || pageSize > MAX_PAGE_SIZE) {
        throw new ApiError(400, 'invalid_page_size', 'Invalid page size');
    }

    return { pageNum, pageSize };
}

const getSortParam = (req: NextRequest): ArticleListSort => {
    const sort = req.nextUrl.searchParams.get('sort') ?? 'new';
    if (sort !== 'new' && sort !== 'hot') {
        throw new ApiError(400, 'invalid_sort', 'Invalid article sort');
    }
    return sort;
}

export async function GET(req: NextRequest) {
    return apiHandler(async () => {
        const { pageNum, pageSize } = getPaginationParams(req);
        const keyword = req.nextUrl.searchParams.get('keyword')?.trim() ?? '';
        const sort = getSortParam(req);

        if (keyword) {
            const items = await getArticleListByKeyWord(keyword, pageNum, pageSize);
            if (!items) throw new ApiError(500, 'article_query_failed', 'Article query failed');
            return { items, pageNum, pageSize };
        }

        const result = await getPublishedArticleList(pageNum, pageSize, sort);
        if (!result) throw new ApiError(500, 'article_query_failed', 'Article query failed');
        return {
            items: result.rows,
            total: result.total,
            pageNum,
            pageSize,
        };
    });
}
