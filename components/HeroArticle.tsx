import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { Article } from "@/types/article";
import CategoryBadge from "./CategoryBadge";

interface Props {
  article: Article;
}

export default function HeroArticle({ article }: Props) {
  const publishedDate = new Date(article.published_at);

  return (
    <Link
      href={`/article/${article.slug}`}
      className="group block relative overflow-hidden bg-surface-dark border border-slate-800 hover:border-slate-600 transition-colors"
      style={{ minHeight: "500px" }}
    >
      {/* Background image */}
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
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #0a1f3a 0%, #0d1f3c 40%, #071828 100%)",
          }}
        />
      )}

      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col justify-end h-full p-8 sm:p-10"
        style={{ minHeight: "500px" }}
      >
        {/* Category + Featured tag */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-byu-tan font-sans">
            Featured
          </span>
          <span className="text-slate-600">·</span>
          <CategoryBadge category={article.category} />
        </div>

        {/* Headline */}
        <h1
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 group-hover:text-slate-100 transition-colors"
          style={{ lineHeight: 1.1, maxWidth: "42rem" }}
        >
          {article.title}
        </h1>

        {/* Summary */}
        <p
          className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6 italic font-display"
          style={{ maxWidth: "36rem" }}
        >
          {article.summary}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-slate-400 font-sans border-t border-slate-700/60 pt-4">
          <span className="font-medium text-slate-300">{article.author}</span>
          <span className="text-slate-600">·</span>
          <span>{format(publishedDate, "MMMM d, yyyy")}</span>
          <span className="text-slate-600">·</span>
          <span>{article.reading_time} min read</span>
          <span className="ml-auto text-byu-tan font-semibold group-hover:underline underline-offset-4 text-sm">
            Read full article →
          </span>
        </div>
      </div>
    </Link>
  );
}
