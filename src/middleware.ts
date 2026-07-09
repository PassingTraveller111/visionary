import {NextRequest, NextResponse} from 'next/server';
import {apiClient} from "@/clientApi";
import type {draftEditorAuthDataType} from "@/shared/api/draft";
import type {ApiResponse} from "@/shared/api/response";

type decodeType = {
    userId: number;
    username: string;
    role: 0 | 1 | 2;
    iat: number;
    exp: number;
};

const publicPages = [
    '/',
    '/search',
    '/userAgreement',
];

const publicPagePatterns = [
    /^\/reader\/[^/]+$/,
    /^\/userCenter\/[^/]+\/article$/,
    /^\/userCenter\/[^/]+\/column$/,
    /^\/userCenter\/Columns\/[^/]+$/,
];

const hasAccess = (decoded: decodeType) => {
    return !decoded.exp || Math.floor(Date.now() / 1000) <= decoded.exp;
}

const base64UrlToBytes = (value: string) => {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    return Uint8Array.from(atob(base64), char => char.charCodeAt(0));
}

const base64UrlToJson = <T,>(value: string): T => {
    const bytes = base64UrlToBytes(value);
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

const verifyTokenInEdge = async (token: string): Promise<decodeType> => {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) throw new Error('Invalid token');

    const header = base64UrlToJson<{ alg?: string }>(encodedHeader);
    if (header.alg !== 'HS256') throw new Error('Unsupported token algorithm');

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) throw new Error('Missing SECRET_KEY');

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );
    const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        base64UrlToBytes(encodedSignature),
        new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );
    if (!isValid) throw new Error('Invalid token signature');

    return base64UrlToJson<decodeType>(encodedPayload);
}

const isPublicAsset = (pathname: string) =>
    !pathname.startsWith('/api/') && /\.[^/]+$/.test(pathname);

const unauthorizedResponse = (pathname: string, req: NextRequest) => {
    return NextResponse.redirect(new URL('/login', req.url));
}

async function jwtMiddleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
    if (token) {
        try {
            const decoded = await verifyTokenInEdge(token);
            if(hasAccess(decoded)){
                if(pathname !== '/login') return NextResponse.next();
                return NextResponse.redirect(new URL('/', req.url)); // login页直接重定向到主页
            }else{
                if(pathname !== '/login') return unauthorizedResponse(pathname, req); // 非login页的请求直接重定向到login页
                return NextResponse.next(); // login页直接放行，避免死循环
            }
        } catch (error) {
            console.error(error);
            if(pathname !== '/login') return unauthorizedResponse(pathname, req);
        }
    } else {
        if(pathname !== '/login') return unauthorizedResponse(pathname, req);
    }
}

async function editorAuthMiddleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (!pathname.startsWith('/editor/draft/')) return NextResponse.next();
    const pathnameParts = pathname.split('/').filter(Boolean);
    const draftIdValue = pathnameParts[2] === 'v2' ? pathnameParts[3] : pathnameParts[2];
    const draftId = draftIdValue === 'new' ? 'new' : Number(draftIdValue);
    if (!draftIdValue || (draftId !== 'new' && Number.isNaN(draftId))) {
        return NextResponse.redirect(new URL('/', req.url));
    }
    const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
    if (token) {
        try {
            const apiData: draftEditorAuthDataType = {
                draftId,
            }
            // 鉴权
            const auth = await apiClient('drafts/editor-auth', {
                baseUrl: `${req.nextUrl.origin}/api/`,
                method: 'POST',
                body: JSON.stringify(apiData),
                headers: {
                    Cookie: req.cookies.toString()
                }
            });
            const authData = auth as ApiResponse<{ auth: boolean }>;
            if(authData.ok) {
                if(authData.data.auth === true) {
                    return NextResponse.next();
                }
            }
            // 无权限，返回主页
            console.log('无访问权限');
            return NextResponse.redirect(new URL('/', req.url));
        } catch (error) {
            console.error(error);
            if(pathname !== '/login') return NextResponse.redirect(new URL('/login', req.url));
        }
    } else {
        if(pathname !== '/login') return NextResponse.redirect(new URL('/login', req.url));
    }
}

function noAuthMiddleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    return publicPages.includes(pathname)
        || publicPagePatterns.some(pattern => pattern.test(pathname));
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    // public 目录下的静态资源不需要鉴权
    if(isPublicAsset(pathname)) return NextResponse.next();
    // 免token页直接放行
    if(noAuthMiddleware(req)) return NextResponse.next();
    // 程序使用权限
    let response = await jwtMiddleware(req);
    // 草稿编辑器权限
    if(response && response.status === 200) response = await editorAuthMiddleware(req);
    // 文档阅读权限

    return response;
}


export const config = {
    matcher: [
        // '/welcome', // 特定路径
        // '/b/:path*', // 前缀匹配
        '/((?!api|_next/static|_next/image|favicon.ico).*)', // 正则表达式过滤内部请求、静态资源
    ],
};
