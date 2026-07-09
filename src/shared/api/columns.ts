import type {Key} from "react";

export type ColumnDto = {
    column_id: number;
    column_name: string;
    cover_image?: string;
    author_id: number;
    description: string;
    created_at: string;
};

export type UpdateColumnRequest = {
    column_id?: number;
    column_name: string;
    cover_image?: string;
    description: string;
};

export type DeleteColumnRequest = {
    column_id: number;
};

export type GetColumnsByUserIdRequest = {
    userId: number;
};

export type GetColumnsByUserIdResponse = {
    msg: 'success' | 'error';
    data: ColumnDto[];
};

export type GetColumnRequest = {
    column_id: number;
};

export type UpdateColumnArticleListRequest = {
    column_id: number;
    article_ids: Key[];
};

export type UpdateColumnArticleListResponse = {
    msg: 'success' | 'error';
};

export type updateColumnReqType = UpdateColumnRequest;
export type deleteColumnReqType = DeleteColumnRequest;
export type getColumnsByUserIdReqType = GetColumnsByUserIdRequest;
export type getColumnsByUserIdResType = GetColumnsByUserIdResponse;
export type getColumnReqType = GetColumnRequest;
export type updateColumnArticleListReqType = UpdateColumnArticleListRequest;
export type updateColumnArticleListResType = UpdateColumnArticleListResponse;
