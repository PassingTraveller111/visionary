"use client"
import {useParams} from "next/navigation";
import {AppDispatch, useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import ReaderHeader from "@/components/ReaderHeader";
import NavLayout from "@/components/NavLayout";
import ReactMarkdown from "@/components/ReactMarkdown";
import styles from './index.module.scss';
import {setReview} from "@/store/features/reviewSlice";
import {useGetReview} from "@/hooks/reviews/useReviews";

const ReviewReaderPage = () => {
    const { reviewId } =  useParams();
    const review = useAppSelector(state => state.rootReducer.reviewReducer.value);
    const getReview = useGetReview();
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        const id = Number(reviewId);
        dispatch(setReview({
            ...review,
            id,
        }))
        if(id) getReview(id);
        // Initialize the review once for the current route id.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewId])
    return <>
        <NavLayout>
            <div className={styles.readerContainer}>
                <div className={styles.readerContent}>
                    <ReaderHeader title={review.title} authorName={review.author_nickname} authorId={review.author_id} draft_id={review.draft_id} />
                    <ReactMarkdown>{review.content}</ReactMarkdown>
                </div>
            </div>
        </NavLayout>
    </>
}
export default ReviewReaderPage;
