import Link from 'next/link';
import MarkdownServer from '@/components/ReactMarkdown/server';
import type {ReviewDto} from '@/shared/api/review';
import {ReaderEditLink} from '../../[articleId]/ReaderClientShell';
import styles from '../../[articleId]/index.module.scss';

const ReviewReaderContent = ({review}: { review: ReviewDto }) => {
    return <article className={styles.readerContent}>
        <ReviewHeader review={review} />
        <MarkdownServer>{review.content}</MarkdownServer>
    </article>;
};

const ReviewHeader = ({review}: { review: ReviewDto }) => {
    return <div className={styles.readerHeaderContainer}>
        <div>
            <span className={styles.title}>{review.title}</span>
        </div>
        <div className={styles.introContainer}>
            <span className={styles.left}>
                <Link className={styles.authorName} href={`/userCenter/${review.author_id}/article`}>{review.author_nickname}</Link>
                <span className={styles.publishTime}>审核稿</span>
            </span>
            <ReaderEditLink authorId={review.author_id} draftId={review.draft_id} />
        </div>
    </div>;
};

export default ReviewReaderContent;
