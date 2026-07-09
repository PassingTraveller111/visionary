export type ApiSuccess<T> = {
    ok: true;
    data: T;
};

export type ApiErrorBody = {
    ok: false;
    error: {
        code: string;
        message: string;
    };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;
