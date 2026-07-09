import {NextResponse} from "next/server";
import type {ApiErrorBody, ApiSuccess} from "@/shared/api/response";

export class ApiError extends Error {
    status: number;
    code: string;

    constructor(status: number, code: string, message: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

export const ok = <T>(data: T, status = 200) => {
    return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { status });
}

export const fail = (status: number, code: string, message: string) => {
    return NextResponse.json<ApiErrorBody>({
        ok: false,
        error: { code, message },
    }, { status });
}

export const apiHandler = async <T>(handler: () => Promise<T> | T) => {
    try {
        return ok(await handler());
    } catch (error) {
        if (error instanceof ApiError) {
            return fail(error.status, error.code, error.message);
        }
        console.error(error);
        return fail(500, 'internal_error', 'Internal server error');
    }
}
