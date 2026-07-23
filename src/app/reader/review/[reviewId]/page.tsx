import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import NavLayout from '@/components/NavLayout';
import {getReview} from '@/server/review/review.service';
import ReaderClientShell from '../../[articleId]/ReaderClientShell';
import ReviewReaderContent from './ReviewReaderContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ReviewReaderPageProps = {
    params: Promise<{
        reviewId: string;
    }>;
};

const parseReviewId = (value: string) => {
    const reviewId = Number(value);
    return Number.isInteger(reviewId) && reviewId > 0 ? reviewId : 0;
};

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: '审核稿预览',
        robots: {
            index: false,
            follow: false,
        },
    };
}

const ReviewReaderPage = async (props: ReviewReaderPageProps) => {
    const {reviewId: reviewIdParam} = await props.params;
    const review = await getReview(parseReviewId(reviewIdParam));

    if (!review) notFound();

    return <NavLayout>
        <ReaderClientShell articleId={review.article_id ?? 0} authorId={review.author_id} markdown={review.content} isPreview>
            <ReviewReaderContent review={review} />
        </ReaderClientShell>
    </NavLayout>;
};

export default ReviewReaderPage;
