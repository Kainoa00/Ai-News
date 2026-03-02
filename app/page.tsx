import { getTodaysArticles, getLatestArticles } from "@/lib/supabase";
import HeroArticle from "@/components/HeroArticle";
import ArticleCard from "@/components/ArticleCard";
import CategoryBadge from "@/components/CategoryBadge";
import { CATEGORIES } from "@/types/article";
import Link from "next/link";
import { format } from "date-fns";

export const revalidate = 3600;

export default async function HomePage() {
  const [todaysArticles, recentArticles] = await Promise.all([
    getTodaysArticles(),
    getLatestArticles(20),
  ]);

  const heroArticle = todaysArticles[0] ?? recentArticles[0];
  const gridArticles = todaysArticles.slice(1, 5);

  const todaySlugs = new Set(todaysArticles.map((a) => a.slug));
  const olderArticles = recentArticles
    .filter((a) => !todaySlugs.has(a.slug))
    .slice(0, 12);

  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="flex items-center justify-between py-4 border-b border-[#2a2a2a] mb-8">
        <p className="text-[#a0a0a0] text-sm font-medium tracking-wide uppercase">{today}</p>
        <p className="text-[#a0a0a0] text-sm">
          {todaysArticles.length > 0
            ? `${todaysArticles.length} articles published today`
            : "Articles publish daily at 7:00 AM MST"}
        </p>
      </div>

      {heroArticle ? <HeroArticle article={heroArticle} /> : <EmptyState />}

      {gridArticles.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-[#e63946] rounded-full" />
            <h2 className="text-xl font-bold text-white tracking-tight">Today&apos;s Stories</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gridArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-[#e63946] rounded-full" />
          <h2 className="text-xl font-bold text-white tracking-tight">Browse by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/category/${cat.toLowerCase()}`}
              className="group flex flex-col items-center justify-center p-5 rounded-xl border border-[#2a2a2a] bg-[#111111] hover:border-[#e63946] hover:bg-[#1a1a1a] transition-all duration-200 text-center"
            >
              <CategoryBadge category={cat} size="lg" />
              <span className="mt-3 text-[#a0a0a0] text-xs group-hover:text-[#f5f5f5] transition-colors">Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      {olderArticles.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-[#e63946] rounded-full" />
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Coverage</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {olderArticles.map((article) => (
              <ArticleCard key={article.id} article={article} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6 border border-[#2a2a2a]">
        <svg className="w-8 h-8 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Today&apos;s briefing is on its way</h2>
      <p className="text-[#a0a0a0] max-w-sm">
        AI Pulse publishes 5 daily articles at 7:00 AM MST. Check back shortly, or browse recent coverage below.
      </p>
    </div>
  );
}
