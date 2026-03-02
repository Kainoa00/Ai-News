import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "AI Pulse — Daily AI Intelligence",
    template: "%s | AI Pulse",
  },
  description:
    "Your daily briefing on artificial intelligence: research breakthroughs, model releases, policy shifts, and industry applications. Updated every morning at 7 AM MST.",
  openGraph: {
    type: "website",
    siteName: "AI Pulse",
    title: "AI Pulse — Daily AI Intelligence",
    description:
      "Your daily briefing on the most important developments in artificial intelligence.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://aipulse.vercel.app"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#0a0a0a] text-[#f5f5f5]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
