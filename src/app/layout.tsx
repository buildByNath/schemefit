import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "SchemeFit - The Smart Scheme Intelligence Engine",
  description: "Discover and prepare for government benefits you may be eligible for.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={atkinson.className}>
        {/* Skip to main content — required for keyboard/screen-reader navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#0F172A] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        <Header />
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
          <Sidebar />
          <main id="main-content" className="flex-1 overflow-y-auto bg-[#F8FAFC]" tabIndex={-1}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
