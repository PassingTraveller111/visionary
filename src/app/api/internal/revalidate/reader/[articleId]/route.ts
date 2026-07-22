import {revalidatePath} from 'next/cache';
import {apiHandler, ApiError} from '@/server/api/response';

type RouteContext = {
    params: Promise<{
        articleId: string;
    }>;
};

export async function POST(request: Request, context: RouteContext) {
    return apiHandler(async () => {
        const expectedSecret = process.env.SECRET_KEY;
        if (!expectedSecret) {
            throw new ApiError(500, 'missing_revalidate_secret', 'Missing revalidate secret');
        }

        const providedSecret = request.headers.get('x-internal-secret');
        if (providedSecret !== expectedSecret) {
            throw new ApiError(401, 'unauthorized_revalidate', 'Unauthorized revalidate request');
        }

        const {articleId} = await context.params;
        const parsedArticleId = Number(articleId);
        if (!Number.isInteger(parsedArticleId) || parsedArticleId <= 0) {
            throw new ApiError(400, 'invalid_article_id', 'Invalid article id');
        }

        const path = `/reader/${parsedArticleId}`;
        revalidatePath(path);

        return {path};
    });
}
