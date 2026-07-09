import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {getCommentListByArticleId, sendArticleComment} from "@/server/article_comments/article_comments.service";
import type {SendCommentRequest} from "@/shared/api/article_comments";

type RouteContext = {
    params: Promise<{
        articleId: string;
    }>;
};

const getArticleId = async (context: RouteContext) => {
    const { articleId } = await context.params;
    const parsedArticleId = Number(articleId);
    if (!Number.isInteger(parsedArticleId) || parsedArticleId <= 0) {
        throw new ApiError(400, 'invalid_article_id', 'Invalid article id');
    }
    return parsedArticleId;
}

export async function GET(_req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const articleId = await getArticleId(context);
        return getCommentListByArticleId(articleId);
    });
}

export async function POST(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const articleId = await getArticleId(context);
        const data: SendCommentRequest = await req.json();
        if (!data.commentText) throw new ApiError(400, 'empty_comment', 'Comment text is required');
        return sendArticleComment(user.userId, articleId, data.commentText, data.parentCommentId);
    });
}
