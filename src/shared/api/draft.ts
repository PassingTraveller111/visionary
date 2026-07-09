export type DraftDto = {
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
    cover?: string;
    update_time?: string;
    create_time?: string;
};

export type UpdateDraftData = {
    draftId: number | 'new';
    content: string;
    title: string;
    summary: string;
    tags: string[];
    author_id: number;
    author_nickname: string;
    cover?: string;
};

export type DraftListItemDto = Pick<DraftDto, 'id' | 'title' | 'review_id' | 'summary' | 'tags' | 'cover' | 'update_time'>;

export type GetDraftResponse = {
    data: DraftDto;
    msg: 'success' | 'error';
};

export type GetDraftListResponse = {
    msg: 'success' | 'error';
    data: DraftListItemDto[];
};

export type PublishDraftData = {
    draftId: number;
};

export type PublishDraftResult = {
    draft_id: number;
    review_id: number;
    article_id: number;
};

export type PublishDraftResponse = {
    data: PublishDraftResult;
    msg: 'success' | 'error';
};

export type DeleteDraftRequest = {
    id: number;
};

export type DeleteDraftResponse = {
    msg: 'success' | 'error';
    data: string;
};

export type DraftEditorAuthData = {
    draftId: number | 'new';
};

export type DraftEditorAuthResponse = {
    msg: 'success' | 'error';
    data: {
        auth: boolean;
    };
};

export type updateDraftDataType = UpdateDraftData;
export type getDraftDataType = { draftId: number };
export type getDraftResponseType = GetDraftResponse;
export type getDraftListRequestType = { authorId: number };
export type getDraftListResponseType = GetDraftListResponse;
export type itemType = DraftListItemDto;
export type publishDraftDataType = PublishDraftData;
export type publishDraftResponseType = PublishDraftResponse;
export type delDraftRequestType = DeleteDraftRequest;
export type delDraftResponse = DeleteDraftResponse;
export type draftEditorAuthDataType = DraftEditorAuthData;
