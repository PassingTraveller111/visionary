import type { Metadata } from "next";
import "./globals.css";
import 'highlight.js/styles/default.css'; // 引入代码高亮样式
import 'katex/dist/katex.min.css'; // 引入 KaTeX 样式
import {ReduxProvider} from "@/store/provider";
import ClientEntry from "@/components/ClientEntry";


export const metadata: Metadata = {
  title: "创见",
  description: "Visionary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
            <ClientEntry/>
            {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
