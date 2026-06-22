import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CompIQ — Compensation Intelligence",
  description: "Level-based compensation data for tech roles in India",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 min-h-screen`}>
        <SessionProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 py-6 text-center text-xs text-gray-400">
            CompIQ · Compensation Intelligence for Indian Tech · Data is crowdsourced and anonymized
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
