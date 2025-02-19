
export type reviewTableType = {
    id: number;
    content: string;
    title: string;
    summary: string;
    tags: string[];
    status: reviewStatusType;
    author_id: number;
    author_nickname: string;
    article_id?: number;
    review_id?: number;
}


export type reviewStatusType = 'reviewing' | 'review_fail' | 'review_success';