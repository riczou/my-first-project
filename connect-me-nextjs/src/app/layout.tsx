import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ConnectMe - Professional Network Intelligence",
  description: "Transform your professional network into career opportunities with AI-powered insights and analytics.",
  keywords: ["networking", "career", "linkedin", "professional", "connections", "job search"],
  authors: [{ name: "ConnectMe Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "ConnectMe - Professional Network Intelligence",
    description: "Transform your professional network into career opportunities with AI-powered insights and analytics.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectMe - Professional Network Intelligence",
    description: "Transform your professional network into career opportunities with AI-powered insights and analytics.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
          {children}
        </div>
      </body>
    </html>
  );
}
