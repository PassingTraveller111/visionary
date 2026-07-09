import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {deleteComment} from "@/server/article_comments/article_comments.service";

type RouteContext = {
    params: Promise<{
        articleId: string;
        commentId: string;
    }>;
};

export async function DELETE(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const user = requireUser(req);
        const { articleId, commentId } = await context.params;
        const parsedArticleId = Number(articleId);
        const parsedCommentId = Number(commentId);
        if (!Number.isInteger(parsedArticleId) || parsedArticleId <= 0) {
            throw new ApiError(400, 'invalid_article_id', 'Invalid article id');
        }
        if (!Number.isInteger(parsedCommentId) || parsedCommentId <= 0) {
            throw new ApiError(400, 'invalid_comment_id', 'Invalid comment id');
        }

        return deleteComment(parsedCommentId, user.userId);
    });
}
