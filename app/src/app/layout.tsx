import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import {
  Bricolage_Grotesque,
  Geist_Mono,
  Inter,
} from "next/font/google";
import { QueryToastSync } from "@/components/query-toast-sync";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

const headingFont = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aby Course",
  description: "Local-first online exam tool for private English teaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <ToastProvider>
          <Suspense fallback={null}>
            <QueryToastSync />
          </Suspense>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
