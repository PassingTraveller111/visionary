
export type draftTableType = {
    id: number;
    content: string;
    title: string;
    summary: string;
    tags: string[];
    status: 'onlyDraft' | 'hasArticle';
    author_id: number;
    author_nickname: string;
    article_id?: number;
    review_id?: number;
}