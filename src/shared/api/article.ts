export type ArticleColumnDto = {
    column_id: number;
    column_name: string;
};

export type ArticleDto = {
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
    cover?: string;
    look_count?: number;
    columns?: ArticleColumnDto[];
};

export type ArticleMetaDto = Pick<ArticleDto, 'look_count' | 'columns'>;

export type GetArticleRequest = {
    articleId: number;
};

export type GetArticleResponse = {
    msg: 'success' | 'error';
    data: ArticleDto;
};

export type ArticleListItemDto = Pick<ArticleDto, 'id' | 'title' | 'review_status' | 'review_id' | 'updated_time' | 'draft_id' | 'is_published' | 'published_time'>;

export type PublishedArticleItemDto = Pick<ArticleDto, 'id' | 'title' | 'review_status' | 'review_id' | 'updated_time' | 'draft_id' | 'is_published' | 'published_time' | 'author_nickname' | 'author_id' | 'summary' | 'tags' | 'cover'> & {
    like_count: number;
    look_count: number;
};

export type ColumnArticleItemDto = Pick<ArticleDto, 'id' | 'title' | 'summary' | 'tags' | 'cover' | 'updated_time'>;

export type ColumnCandidateArticleDto = Pick<ArticleDto, 'id' | 'title' | 'updated_time'>;

export type GetArticleListRequest = {
    authorId: number;
};

export type GetArticleListResponse = {
    msg: 'success' | 'error';
    data: ArticleListItemDto[];
};

export type GetPublishedArticleListRequest = {
    pageNum: number;
    pageSize: number;
    sort?: ArticleListSort;
};

export type ArticleListSort = 'new' | 'hot';

export type GetPublishedArticleListResponse = {
    msg: 'success' | 'error';
    data: PublishedArticleItemDto[];
    total?: number;
    pageNum?: number;
    pageSize?: number;
};

export type GetArticleListByKeyWordRequest = GetPublishedArticleListRequest & {
    keyword: string;
};

export type GetArticleListByKeyWordResponse = {
    msg: 'success' | 'error';
    data: PublishedArticleItemDto[];
    total?: number;
    pageNum?: number;
    pageSize?: number;
};

export type GetArticleCountByUserIdRequest = {
    userId: number;
};

export type GetArticleCountByUserIdResponse = {
    msg: 'success';
    data: {
        articleCounts: number;
    };
} | {
    msg: 'error';
};

export type GetArticleListByColumnIdRequest = {
    column_id: number;
};

export type GetArticleListByColumnIdResponse = {
    msg: 'success' | 'error';
    data: ColumnArticleItemDto[];
};

export type GetArticleListToAddColumnResponse = {
    msg: 'success' | 'error';
    data: ColumnCandidateArticleDto[];
};

export type ArticleQueryResult = {
    items: PublishedArticleItemDto[];
    total?: number;
    pageNum: number;
    pageSize: number;
};

export type getArticleRequestType = GetArticleRequest;
export type getArticleResponseType = GetArticleResponse;
export type getArticleListRequestType = GetArticleListRequest;
export type getArticleListResponseType = GetArticleListResponse;
export type itemType = ArticleListItemDto;
export type getPublishedArticleListRequestType = GetPublishedArticleListRequest;
export type getPublishedArticleListResponseType = GetPublishedArticleListResponse;
export type publishedItemType = PublishedArticleItemDto;
export type getArticleListByKeyWordRequestType = GetArticleListByKeyWordRequest;
export type getArticleListByKeyWordResponseType = GetArticleListByKeyWordResponse;
export type ItemType = PublishedArticleItemDto;
export type getArticleCountByUserIdRequest = GetArticleCountByUserIdRequest;
export type getArticleCountByUserIdResponse = GetArticleCountByUserIdResponse;
export type getArticleListByColumnIdReqType = GetArticleListByColumnIdRequest;
export type getArticleListByColumnIdResType = GetArticleListByColumnIdResponse;
export type getArticleListToAddColumnResType = GetArticleListToAddColumnResponse;
