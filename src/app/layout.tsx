import type { Metadata, Viewport } from "next";
import "./globals.css";
import 'highlight.js/styles/default.css'; // 引入代码高亮样式
import 'katex/dist/katex.min.css'; // 引入 KaTeX 样式
// 配置antd为中文
import locale from 'antd/locale/zh_CN';

import {ReduxProvider} from "@/store/provider";
import ClientEntry from "@/components/ClientEntry";
import {ConfigProvider} from "antd";
import {TrackProvider} from "@/app/TrackProvider";


export const metadata: Metadata = {
  title: "创见",
  description: "Visionary",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReduxProvider>
            <ConfigProvider locale={locale}>
                <TrackProvider />
                <ClientEntry/>
                {children}
            </ConfigProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
