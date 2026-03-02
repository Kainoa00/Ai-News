import Link from "next/link";
import { CATEGORIES } from "@/types/article";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#2a2a2a] bg-[#0a0a0a] mt-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-[#e63946] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-serif text-lg font-bold text-white">AI Pulse</span>
            </Link>
            <p className="text-[#a0a0a0] text-sm leading-relaxed">
              Daily AI intelligence for founders, researchers, and investors. Published every morning at 7:00 AM MST.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link href={`/category/${cat.toLowerCase()}`} className="text-[#a0a0a0] text-sm hover:text-white transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Publication Schedule</h4>
            <div className="space-y-3 text-sm text-[#a0a0a0]">
              <div className="flex items-start gap-2"><span className="text-[#e63946] mt-0.5">→</span><span>5 articles published daily</span></div>
              <div className="flex items-start gap-2"><span className="text-[#e63946] mt-0.5">→</span><span>7:00 AM MST every day</span></div>
              <div className="flex items-start gap-2"><span className="text-[#e63946] mt-0.5">→</span><span>Grounded in real-time news sources</span></div>
              <div className="flex items-start gap-2"><span className="text-[#e63946] mt-0.5">→</span><span>Analysis powered by Claude</span></div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#666666] text-xs">© {year} AI Pulse. Articles are AI-generated from real news sources.</p>
          <p className="text-[#666666] text-xs">Built with Next.js · Powered by Anthropic Claude</p>
        </div>
      </div>
    </footer>
  );
}
