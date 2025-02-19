import {AppDispatch, useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {apiClient, apiList} from "@/clientApi";
import {getReviewRequestType, getReviewResponseType} from "@/app/api/protected/review/getReview/route";
import {setReview} from "@/store/features/reviewSlice";


export const useGetReview = () => {
    const review = useAppSelector(state => state.rootReducer.reviewReducer.value);
    const dispatch = useDispatch<AppDispatch>();
    return async (id?: number) => {
        const apiData: getReviewRequestType = {
            review_id: id ?? review.id as number,
        }
        const res = await apiClient(apiList.post.protected.review.getReview,  {
            method: 'POST',
            body: JSON.stringify(apiData)
        }) as getReviewResponseType;
        if (res.msg === 'success') {
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
        return res;
    }
}