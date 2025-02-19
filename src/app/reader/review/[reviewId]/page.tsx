"use client"
import {useParams} from "next/navigation";
import {AppDispatch, useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {useCallback, useEffect} from "react";
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
    // 初始化article
    const initArticle = useCallback(() => {
        const id = Number(reviewId);
        dispatch(setReview({
            ...review,
            id,
        }))
        if(id) getReview(id);
    }, []);
    useEffect(() => {
        initArticle();
    }, [initArticle])
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