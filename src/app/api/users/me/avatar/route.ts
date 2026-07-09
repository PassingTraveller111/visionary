import {NextRequest} from "next/server";
import {apiHandler} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {updateUserAvatar} from "@/server/user/user.service";
import type {updateUserAvatarRequestType} from "@/shared/api/user";

export async function PATCH(req: NextRequest) {
    return apiHandler(async () => {
        const { userId } = requireUser(req);
        const { avatarUrl }: updateUserAvatarRequestType = await req.json();
        return updateUserAvatar(userId, avatarUrl);
    });
}
