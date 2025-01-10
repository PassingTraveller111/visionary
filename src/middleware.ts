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
            const accessInfo = accessDecode(decoded);
            if(accessInfo.access){
                if(pathname !== '/login') return NextResponse.next();
                return NextResponse.redirect(new URL('/', req.url)); // login页直接重定向到主页
            }else{
                if(pathname !== '/login') return NextResponse.redirect(new URL('/login', req.url)); // 非login页的请求直接重定向到login页
                return NextResponse.next(); // login页直接放行，避免死循环
            }
        } catch (error) {
            console.error(error);
            if(pathname !== '/login') return NextResponse.redirect(new URL('/login', req.url));
        }
    } else {
        if(pathname !== '/login') return NextResponse.redirect(new URL('/login', req.url));
    }
}
export function middleware(req: NextRequest) {
    return jwtMiddleware(req);
}
export const config = {
    matcher: [
        // '/welcome', // 特定路径
        // '/b/:path*', // 前缀匹配
        '/((?!api|_next/static|_next/image|favicon.ico).*)', // 正则表达式过滤内部请求、静态资源
    ],
};
