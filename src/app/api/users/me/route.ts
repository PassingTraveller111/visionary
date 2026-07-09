import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {getUserInfo, updateUserInfo} from "@/server/user/user.service";
import type {updateUserInfoRequestType} from "@/shared/api/user";

export async function GET(req: NextRequest) {
    return apiHandler(async () => {
        const { userId } = requireUser(req);
        const data = await getUserInfo(userId);
        if (!data) throw new ApiError(404, 'user_not_found', 'User not found');
        return data;
    });
}

export async function PATCH(req: NextRequest) {
    return apiHandler(async () => {
        const { userId } = requireUser(req);
        const data: updateUserInfoRequestType = await req.json();
        return updateUserInfo(userId, data);
    });
}
