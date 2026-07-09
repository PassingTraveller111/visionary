export type ReviewDto = {
    id: number;
    content: string;
    title: string;
    summary: string;
    tags: string[];
    status: 'reviewing' | 'review_fail' | 'review_success';
    author_id: number;
    author_nickname: string;
    article_id?: number;
    draft_id?: number;
    cover?: string;
};

export type getReviewRequestType = {
    review_id: number;
};

export type getReviewResponseType = {
    msg: 'success' | 'error';
    data: ReviewDto;
};
