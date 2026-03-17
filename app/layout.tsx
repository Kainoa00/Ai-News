import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "The BYU AI Chronicle — Weekly AI Intelligence",
    template: "%s | The BYU AI Chronicle",
  },
  description:
    "Your weekly briefing on artificial intelligence: research breakthroughs, model releases, policy shifts, and industry applications. Published every Wednesday.",
  openGraph: {
    type: "website",
    siteName: "The BYU AI Chronicle",
    title: "The BYU AI Chronicle — Weekly AI Intelligence",
    description:
      "Your weekly briefing on the most important developments in artificial intelligence.",
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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg-dark text-slate-100 font-display antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
