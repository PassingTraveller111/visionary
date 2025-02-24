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
};

export default nextConfig;
