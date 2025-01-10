import {NextRequest, NextResponse} from 'next/server';
import axios from "axios";
import {accessDecode, decodeType} from "@/utils/auth";

async function jwtMiddleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
    if (token) {
        try {
            const res = await axios.post('http://localhost:3000/api/user/jwt', {
                token,
            });
            const decoded:decodeType = res.data.decoded;
            console.log(accessDecode(decoded));
            if(!accessDecode(decoded).access && pathname !== '/login') return NextResponse.redirect(new URL('/login', req.url)); // 解码失败，重定向到login页
            if(accessDecode(decoded).access && pathname === '/login') return NextResponse.redirect(new URL('/', req.url)); // 重定向到登录页
        } catch (error) {
            console.error(error);
            if(pathname !== '/login') return NextResponse.redirect(new URL('/login', req.url));
        }
    } else {
        if(pathname !== '/login') return NextResponse.redirect(new URL('/login', req.url));
    }
}
export function middleware(req: NextRequest) {
    console.log('middleware');
    return jwtMiddleware(req);
}
export const config = {
    matcher: [
        // '/welcome', // 特定路径
        // '/b/:path*', // 前缀匹配
        '/((?!api|_next/static|_next/image|favicon.ico).*)', // 正则表达式过滤内部请求、静态资源
    ],
};
