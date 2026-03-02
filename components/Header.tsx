"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/types/article";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#2a2a2a]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-[#e63946] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-serif text-xl font-bold text-white tracking-tight group-hover:text-[#e63946] transition-colors">
              AI Pulse
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pathname === "/" ? "text-white bg-[#1a1a1a]" : "text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]"}`}>
              Today
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat.toLowerCase()}`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pathname === `/category/${cat.toLowerCase()}` ? "text-white bg-[#1a1a1a]" : "text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]"}`}
              >
                {cat}
              </Link>
            ))}
          </nav>

          <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#a0a0a0] bg-[#111111] border border-[#2a2a2a] px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Daily at 7:00 AM MST
          </span>
        </div>
      </div>

      <div className="md:hidden border-t border-[#2a2a2a] overflow-x-auto">
        <div className="flex items-center gap-1 px-4 py-2">
          <Link href="/" className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${pathname === "/" ? "text-white bg-[#e63946]" : "text-[#a0a0a0] bg-[#111111] border border-[#2a2a2a]"}`}>
            Today
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/category/${cat.toLowerCase()}`}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${pathname === `/category/${cat.toLowerCase()}` ? "text-white bg-[#e63946]" : "text-[#a0a0a0] bg-[#111111] border border-[#2a2a2a]"}`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
