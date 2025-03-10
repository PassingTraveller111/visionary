
export type articleTableType = {
    id: number;
    content: string;
    title: string;
    summary: string;
    tags: string[];
    review_status: 'pending_review' | 'failed_review' | 'already_review';
    is_published: 0 | 1;
    published_time: string;
    updated_time: string;
    author_id: number;
    author_nickname: string;
    collects: number;
    draft_id?: number;
    review_id?: number;
}

