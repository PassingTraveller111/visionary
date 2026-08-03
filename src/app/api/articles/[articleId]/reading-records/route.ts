import {createHash, randomUUID} from "crypto";
import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {getCurrentUser} from "@/server/auth/currentUser";
import {insertArticleReadingRecord} from "@/server/article_reading_records/article_reading_records.service";

const VISITOR_COOKIE = 'visionary_visitor_id';
const BOT_USER_AGENT = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headless/i;

type RouteContext = {
    params: Promise<{
        articleId: string;
    }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
    let visitorCookie: string | undefined;
    const response = await apiHandler(async () => {
        const { articleId } = await context.params;
        const parsedArticleId = Number(articleId);
        if (!Number.isInteger(parsedArticleId) || parsedArticleId <= 0) {
            throw new ApiError(400, 'invalid_article_id', 'Invalid article id');
        }

        const user = getCurrentUser(req);
        if (!user && BOT_USER_AGENT.test(req.headers.get('user-agent') ?? '')) {
            return { inserted: false };
        }

        visitorCookie = user ? undefined : req.cookies.get(VISITOR_COOKIE)?.value ?? randomUUID();
        const visitorId = visitorCookie
            ? createHash('sha256').update(visitorCookie).digest('hex')
            : undefined;
        const data = await insertArticleReadingRecord(parsedArticleId, user?.userId ?? null, visitorId);
        if (!data) throw new ApiError(500, 'reading_record_insert_failed', 'Reading record insert failed');
        return data;
    });

    if (visitorCookie && !req.cookies.has(VISITOR_COOKIE)) {
        response.cookies.set(VISITOR_COOKIE, visitorCookie, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
    }

    return response;
}
