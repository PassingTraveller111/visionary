import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    env: {

    },
    images: {
        remotePatterns: [
            {
                protocol: 'https', // 协议，通常为 'http' 或 'https'
                hostname: 'visionary-1305469650.cos.ap-beijing.myqcloud.com', // 主机名
                port: '', // 端口号，如果为空字符串则表示使用默认端口
                pathname: '/**', // 路径名，'/**' 表示匹配所有路径
            },
        ],
    },
    eslint: {
        // 构建时禁用检查
        ignoreDuringBuilds: true,
    },
    async headers() {
        return [
            {
                source: "/api/:path*", // 匹配所有 API 路径
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // 替换为你的实际 Origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ],
            },
        ];
    },
};

export default nextConfig;
