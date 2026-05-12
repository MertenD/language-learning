import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {TRPCReactProvider} from "@/trpc/client";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {Toaster} from "sonner";
import React from "react";
import {NuqsAdapter} from "nuqs/adapters/next/app";
import {LanguageProvider} from "@/features/user/hooks/use-language";
import {OfflineBanner} from "@/components/offline-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Language Learning",
  description: "Learning new languages made easy",
  appleWebApp: {
    capable: true,
    title: "LangLearn",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <TRPCReactProvider>
          <NuqsAdapter>
            <LanguageProvider>
            {children}
            <Toaster />
            <OfflineBanner />
            { process.env.NODE_ENV !== "production" && <ReactQueryDevtools /> }
            </LanguageProvider>
          </NuqsAdapter>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
