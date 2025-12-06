import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Noto_Sans_JP } from "next/font/google";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { Spinner } from "@/components/ui/spinner";
import { SessionProvider } from "@/provider/session-provider";
import { TanstackQueryProvider } from "@/provider/tanstack-query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Photo Spot",
  description: "お気に入りの写真スポットを共有しよう",
};

export const revalidate = 60;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <TanstackQueryProvider>
        <SessionProvider>
          <body
            className={`${notoSansJP.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <Header />
            <Suspense
              fallback={
                <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
                  <Spinner size={48} className="text-primary" />
                </div>
              }
            >
              <main>{children}</main>
            </Suspense>
          </body>
        </SessionProvider>
      </TanstackQueryProvider>
    </html>
  );
}
