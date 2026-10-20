import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rozgar Radar — AI Job Matching for India",
  description:
    "Match your student/fresher profile to Indian jobs, understand eligibility, and get daily alerts.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-black text-white selection:bg-white/20 selection:text-white">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 min-h-[calc(100vh-140px)]">
          {children}
        </main>

        <footer className="border-t border-gray-800/50 bg-black py-8 text-xs text-gray-400">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Rozgar Radar</span>
              <span className="text-gray-600">•</span>
              <span>AI Job Hunting & Eligibility for Indian Students</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-gray-400">
              <a
                href="mailto:rozgarradar000@gmail.com"
                className="transition hover:text-white flex items-center gap-1.5"
              >
                <span>✉️</span> rozgarradar000@gmail.com
              </a>
              <span className="text-gray-700">•</span>
              <a
                href="tel:+919670630486"
                className="transition hover:text-white flex items-center gap-1.5"
              >
                <span>📞</span> +91 96706 30486
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
