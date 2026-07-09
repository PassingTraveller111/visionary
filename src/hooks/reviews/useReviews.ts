import {AppDispatch, useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {apiClient} from "@/clientApi";
import type {getReviewResponseType, ReviewDto} from "@/shared/api/review";
import {setReview} from "@/store/features/reviewSlice";
import type {ApiResponse} from "@/shared/api/response";


export const useGetReview = () => {
    const review = useAppSelector(state => state.rootReducer.reviewReducer.value);
    const dispatch = useDispatch<AppDispatch>();
    return async (id?: number) => {
        const reviewId = id ?? review.id as number;
        const res = await apiClient(`reviews/${reviewId}`) as ApiResponse<ReviewDto>;
        if (res.ok) {
            const { title, id, content, author_nickname, author_id, draft_id, tags, summary } = res.data;
            dispatch(setReview(
                {
                    ...review,
                    id,
                    title,
                    content,
                    author_id,
                    author_nickname,
                    draft_id,
                    tags,
                    summary,
                }
            ));
        }
        if (res.ok) return { msg: 'success' as const, data: res.data } satisfies getReviewResponseType;
        return { msg: 'error' as const, data: review as ReviewDto } satisfies getReviewResponseType;
    }
}
