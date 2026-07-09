import {NextRequest} from "next/server";
import {verifyToken, type decodeType} from "@/utils/auth";
import {ApiError} from "@/server/api/response";

export type CurrentUser = Pick<decodeType, 'userId' | 'username' | 'role'>;

export const getCurrentUser = (req: NextRequest): CurrentUser | null => {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;

    try {
        const decoded = verifyToken(token);
        return {
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role,
        };
    } catch {
        return null;
    }
}

export const requireUser = (req: NextRequest): CurrentUser => {
    const user = getCurrentUser(req);
    if (!user) throw new ApiError(401, 'unauthorized', 'Unauthorized');
    return user;
}
