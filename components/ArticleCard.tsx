import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { Article } from "@/types/article";
import CategoryBadge from "./CategoryBadge";

interface Props {
  article: Article;
  compact?: boolean;
}

export default function ArticleCard({ article, compact = false }: Props) {
  return (
    <Link href={`/article/${article.slug}`} className="article-card group block rounded-xl overflow-hidden bg-[#111111] border border-[#2a2a2a] hover:border-[#3a3a3a]">
      <div className={`relative w-full bg-[#1a1a1a] overflow-hidden ${compact ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        {article.image_url ? (
          <>
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
              unoptimized
            />
            <div className="absolute inset-0 card-overlay" />
          </>
        ) : (
          <GradientPlaceholder category={article.category} />
        )}
        <div className="absolute bottom-3 left-3 z-10">
          <CategoryBadge category={article.category} size="sm" />
        </div>
      </div>

      <div className="p-4">
        <h3 className={`font-serif font-bold text-white group-hover:text-[#e63946] transition-colors leading-snug mb-2 ${compact ? "text-sm" : "text-base"}`}>
          {article.title}
        </h3>
        {!compact && (
          <p className="text-[#a0a0a0] text-sm leading-relaxed mb-3 line-clamp-2">{article.summary}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-[#666666]">
          <span>{format(new Date(article.published_at), "MMM d")}</span>
          <span>·</span>
          <span>{article.reading_time} min</span>
        </div>
      </div>
    </Link>
  );
}

function GradientPlaceholder({ category }: { category: string }) {
  const gradients: Record<string, string> = {
    Research: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%)",
    Products: "linear-gradient(135deg, #0d2a0d 0%, #1b3b1b 50%, #0d2a0d 100%)",
    Policy: "linear-gradient(135deg, #2a1f0d 0%, #3b2e1b 50%, #2a1f0d 100%)",
    Models: "linear-gradient(135deg, #1b0d2a 0%, #2e1b3b 50%, #1b0d2a 100%)",
    Applications: "linear-gradient(135deg, #2a150d 0%, #3b241b 50%, #2a150d 100%)",
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: gradients[category] ?? gradients.Research }}>
      <span className="text-4xl opacity-20 select-none font-serif text-white">{category[0]}</span>
    </div>
  );
}
