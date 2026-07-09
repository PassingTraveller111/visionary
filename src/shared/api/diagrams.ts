export type DiagramDto = {
    id: number;
    title: string;
    data: string;
    intro: string;
    tags: string[];
    author_id: number;
    cover?: string;
    type: 'flow' | 'mindMap';
    update_time: string;
    create_time: string;
};

export type UpdateDiagramRequest = {
    id: number | 'new';
} & Pick<DiagramDto, 'type' | 'data' | 'intro' | 'tags' | 'title' | 'author_id' | 'cover'>;

export type GetDiagramRequest = {
    id: number;
};

export type GetDiagramResponse = {
    msg: 'success' | 'error';
    data: DiagramDto;
};

export type GetDiagramsListResponse = {
    msg: 'success' | 'error';
    data: DiagramDto[];
};

export type DeleteDiagramRequest = {
    id: number;
};

export type RenameDiagramRequest = {
    id: number;
    title: string;
};

export type DiagramCoverDto = {
    id: number;
    title: string;
    cover: string;
    author_id: number;
};

export type GetDiagramCoverByIdRequest = {
    id: number;
};

export type GetDiagramCoverByIdResponse = {
    msg: 'success' | 'error';
    data: DiagramCoverDto;
};

export type updateDiagramReqType = UpdateDiagramRequest;
export type getDiagramReqType = GetDiagramRequest;
export type getDiagramResType = GetDiagramResponse;
export type getDiagramsListResType = GetDiagramsListResponse;
export type delDiagramReqType = DeleteDiagramRequest;
export type renameDiagramReqType = RenameDiagramRequest;
export type getDiagramCoverByIdReqType = GetDiagramCoverByIdRequest;
export type getDiagramCoverByIdResType = GetDiagramCoverByIdResponse;
