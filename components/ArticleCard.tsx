import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { Article } from "@/types/article";
import CategoryBadge from "./CategoryBadge";

interface Props {
  article: Article;
  compact?: boolean;
  /** Show in stacked (horizontal) layout — image left, text right */
  horizontal?: boolean;
}

export default function ArticleCard({
  article,
  compact = false,
  horizontal = false,
}: Props) {
  const publishedDate = new Date(article.published_at);

  if (horizontal) {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="article-card group flex gap-4 p-4 border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
      >
        {/* Thumbnail */}
        {article.image_url && (
          <div className="relative w-20 h-20 flex-shrink-0 bg-slate-800 overflow-hidden rounded">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <CategoryBadge category={article.category} size="sm" />
          <h4 className="mt-1.5 text-sm font-bold text-slate-200 group-hover:text-white transition-colors leading-snug font-display">
            {article.title}
          </h4>
          <p className="mt-1 text-xs text-slate-500 font-sans">
            {format(publishedDate, "MMM d")} · {article.reading_time} min read
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/article/${article.slug}`}
      className="article-card group block bg-surface-dark border border-slate-800 hover:border-slate-600 transition-colors overflow-hidden"
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-slate-800 overflow-hidden">
        {article.image_url ? (
          <>
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <GradientPlaceholder category={article.category} />
        )}
        <div className="absolute bottom-3 left-3 z-10">
          <CategoryBadge category={article.category} size="sm" />
        </div>
      </div>

      {/* Text */}
      <div className="p-4">
        <h3
          className={`font-display font-bold text-slate-100 group-hover:text-white transition-colors leading-snug mb-2 ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {article.title}
        </h3>
        {!compact && (
          <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2 font-sans">
            {article.summary}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
          <span>{format(publishedDate, "MMM d, yyyy")}</span>
          <span className="text-slate-700">·</span>
          <span>{article.reading_time} min read</span>
        </div>
      </div>
    </Link>
  );
}

function GradientPlaceholder({ category }: { category: string }) {
  const gradients: Record<string, string> = {
    Research:
      "linear-gradient(135deg, #071828 0%, #0d2640 50%, #071828 100%)",
    Products:
      "linear-gradient(135deg, #071a12 0%, #0d2e1f 50%, #071a12 100%)",
    Policy:
      "linear-gradient(135deg, #1a150a 0%, #2e2314 50%, #1a150a 100%)",
    Models:
      "linear-gradient(135deg, #120a1f 0%, #1f1233 50%, #120a1f 100%)",
    Applications:
      "linear-gradient(135deg, #1a0f07 0%, #2e1c0e 50%, #1a0f07 100%)",
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: gradients[category] ?? gradients.Research }}
    >
      <span className="text-5xl opacity-10 select-none font-display text-white font-black">
        {category[0]}
      </span>
    </div>
  );
}
