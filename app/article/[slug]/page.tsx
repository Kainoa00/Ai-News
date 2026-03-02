import { getArticleBySlug, getLatestArticles } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import CategoryBadge from "@/components/CategoryBadge";
import ArticleCard from "@/components/ArticleCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.published_at,
      images: article.image_url ? [{ url: article.image_url }] : [],
    },
  };
}

export const revalidate = 3600;

export default async function ArticlePage({ params }: PageProps) {
  const [article, relatedArticles] = await Promise.all([
    getArticleBySlug(params.slug),
    getLatestArticles(8),
  ]);

  if (!article) notFound();

  const related = relatedArticles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 3);

  const publishedDate = new Date(article.published_at);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <nav className="flex items-center gap-2 py-6 text-sm text-[#a0a0a0]">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/category/${article.category.toLowerCase()}`} className="hover:text-white transition-colors">
          {article.category}
        </Link>
        <span>/</span>
        <span className="text-[#f5f5f5] truncate max-w-[300px]">{article.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        <article>
          <div className="flex items-center gap-3 mb-5">
            <CategoryBadge category={article.category} />
            <span className="text-[#a0a0a0] text-sm">{format(publishedDate, "MMMM d, yyyy")}</span>
            <span className="text-[#2a2a2a]">·</span>
            <span className="text-[#a0a0a0] text-sm">{article.reading_time} min read</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6" style={{ lineHeight: 1.15 }}>
            {article.title}
          </h1>

          <p className="text-xl text-[#a0a0a0] leading-relaxed mb-8 font-medium border-l-2 border-[#e63946] pl-4">
            {article.summary}
          </p>

          {article.image_url && (
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-10 bg-[#1a1a1a]">
              <Image src={article.image_url} alt={article.title} fill className="object-cover" priority unoptimized />
            </div>
          )}

          <div className="article-content max-w-[72ch]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </div>

          {article.source_urls.length > 0 && (
            <div className="mt-10 pt-8 border-t border-[#2a2a2a]">
              <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wider mb-3">Sources</h3>
              <ul className="space-y-2">
                {article.source_urls.map((url, i) => (
                  <li key={i}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#e63946] hover:text-[#ff6b75] transition-colors break-all">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-[#2a2a2a] flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e63946] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AP</div>
            <div>
              <p className="text-white font-medium text-sm">{article.author}</p>
              <p className="text-[#a0a0a0] text-xs">AI Pulse · Published {format(publishedDate, "EEEE, MMMM d, yyyy")}</p>
            </div>
          </div>
        </article>

        <aside>
          <div className="sticky top-6">
            <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wider mb-4">More in {article.category}</h3>
            {related.length > 0 ? (
              <div className="space-y-4">
                {related.map((a) => (
                  <Link key={a.id} href={`/article/${a.slug}`} className="block group">
                    <div className="p-4 rounded-xl bg-[#111111] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
                      <CategoryBadge category={a.category} size="sm" />
                      <h4 className="mt-2 text-sm font-semibold text-white group-hover:text-[#e63946] transition-colors leading-snug">{a.title}</h4>
                      <p className="mt-1 text-xs text-[#a0a0a0]">{format(new Date(a.published_at), "MMM d")} · {a.reading_time} min</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[#a0a0a0] text-sm">No related articles yet.</p>
            )}

            <div className="mt-6 p-5 rounded-xl bg-[#e63946] bg-opacity-10 border border-[#e63946] border-opacity-30">
              <p className="text-sm font-semibold text-white mb-1">Daily AI Briefing</p>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">5 articles published every morning at 7:00 AM MST.</p>
              <Link href="/" className="mt-3 inline-block text-xs text-[#e63946] hover:text-[#ff6b75] font-semibold transition-colors">
                View today&apos;s briefing →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
