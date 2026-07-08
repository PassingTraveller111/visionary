import {NextRequest} from "next/server";
import {verifyToken} from "@/utils/auth";

export const getOptionalUserId = (req: NextRequest) => {
    const token = req.cookies.get('token')?.value ?? '';
    if (!token) return 0;
    try {
        return verifyToken(token).userId;
    } catch {
        return 0;
    }
}
