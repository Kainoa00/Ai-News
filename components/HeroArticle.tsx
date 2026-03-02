import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { Article } from "@/types/article";
import CategoryBadge from "./CategoryBadge";

interface Props {
  article: Article;
}

export default function HeroArticle({ article }: Props) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group block relative w-full rounded-2xl overflow-hidden bg-[#111111] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all"
      style={{ minHeight: "480px" }}
    >
      {article.image_url ? (
        <>
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
            priority
            unoptimized
          />
          <div className="absolute inset-0 hero-overlay" />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a0a0a 0%, #0d0d1a 50%, #0a1a0a 100%)" }} />
      )}

      <div className="relative z-10 flex flex-col justify-end h-full p-8 sm:p-10" style={{ minHeight: "480px" }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-[#e63946] uppercase tracking-widest">Featured</span>
          <span className="text-[#2a2a2a]">·</span>
          <CategoryBadge category={article.category} />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 group-hover:text-[#f0f0f0] transition-colors max-w-4xl" style={{ lineHeight: 1.15 }}>
          {article.title}
        </h1>

        <p className="text-[#d0d0d0] text-base sm:text-lg leading-relaxed max-w-2xl mb-6">
          {article.summary}
        </p>

        <div className="flex items-center gap-4 text-sm text-[#a0a0a0]">
          <span>{article.author}</span>
          <span className="text-[#3a3a3a]">·</span>
          <span>{format(new Date(article.published_at), "MMMM d, yyyy")}</span>
          <span className="text-[#3a3a3a]">·</span>
          <span>{article.reading_time} min read</span>
          <span className="ml-auto text-[#e63946] font-medium text-sm group-hover:underline">Read full article →</span>
        </div>
      </div>
    </Link>
  );
}
