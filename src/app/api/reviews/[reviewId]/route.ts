import {apiHandler, ApiError} from "@/server/api/response";
import {getReview} from "@/server/review/review.service";

type RouteContext = {
    params: Promise<{
        reviewId: string;
    }>;
};

export async function GET(_req: Request, context: RouteContext) {
    return apiHandler(async () => {
        const { reviewId } = await context.params;
        const parsedReviewId = Number(reviewId);
        if (!Number.isInteger(parsedReviewId) || parsedReviewId <= 0) {
            throw new ApiError(400, 'invalid_review_id', 'Invalid review id');
        }

        const data = await getReview(parsedReviewId);
        if (!data) throw new ApiError(404, 'review_not_found', 'Review not found');
        return data;
    });
}
