import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {requireUser} from "@/server/auth/currentUser";
import {uploadUserAvatar} from "@/server/user/user.service";

export async function POST(req: NextRequest) {
    return apiHandler(async () => {
        const { userId } = requireUser(req);
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) throw new ApiError(400, 'missing_file', 'No file provided');
        return uploadUserAvatar(userId, file);
    });
}
