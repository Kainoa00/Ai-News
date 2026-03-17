"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/types/article";

function ChronicleIcon() {
  return (
    <svg
      className="size-6 flex-shrink-0"
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
        fill="currentColor"
      />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#editions", label: "Weekly Editions" },
  { href: "/category/research", label: "Research" },
  { href: "/category/models", label: "Models" },
  { href: "/category/policy", label: "Policy" },
  { href: "/category/products", label: "Products" },
];

export default function Header() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-surface-dark">
      <div className="flex items-center justify-between px-6 md:px-10 py-4 max-w-[1400px] mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity"
        >
          <ChronicleIcon />
          <span className="text-base md:text-lg font-bold leading-tight tracking-[-0.015em] uppercase font-sans">
            The BYU AI Chronicle
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7 font-sans ml-8">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={`${href}-${label}`}
              href={href}
              className={`text-sm font-semibold leading-normal transition-colors pb-0.5 ${
                isActive(href)
                  ? "text-white border-b-2 border-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Subscribe button */}
        <button className="flex-shrink-0 cursor-pointer items-center justify-center rounded h-9 px-5 bg-primary text-white text-sm font-bold font-sans hover:bg-primary/80 transition-colors hidden sm:flex ml-auto lg:ml-8">
          Subscribe
        </button>
      </div>

      {/* Mobile scrollable nav */}
      <div className="lg:hidden border-t border-slate-800 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1.5 px-4 py-2 font-sans">
          <Link
            href="/"
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              pathname === "/"
                ? "bg-primary text-white"
                : "text-slate-400 bg-slate-800/60 border border-slate-700 hover:text-white"
            }`}
          >
            Home
          </Link>
          {CATEGORIES.map((cat) => {
            const href = `/category/${cat.toLowerCase()}`;
            const active = pathname === href;
            return (
              <Link
                key={cat}
                href={href}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-slate-400 bg-slate-800/60 border border-slate-700 hover:text-white"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
