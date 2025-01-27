import type { Metadata } from "next";
import "./globals.css";
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
