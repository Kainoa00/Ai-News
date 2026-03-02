import { getArticlesByCategory } from "@/lib/supabase";
import { CATEGORIES, CATEGORY_DESCRIPTIONS, type ArticleCategory } from "@/types/article";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import CategoryBadge from "@/components/CategoryBadge";

interface PageProps {
  params: { category: string };
}

function resolveCategory(param: string): ArticleCategory | null {
  const normalized = param.charAt(0).toUpperCase() + param.slice(1).toLowerCase();
  return CATEGORIES.includes(normalized as ArticleCategory) ? (normalized as ArticleCategory) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = resolveCategory(params.category);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category} — AI Pulse`,
    description: CATEGORY_DESCRIPTIONS[category],
  };
}

export const revalidate = 3600;

export default async function CategoryPage({ params }: PageProps) {
  const category = resolveCategory(params.category);
  if (!category) notFound();

  const articles = await getArticlesByCategory(category, 30);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <nav className="flex items-center gap-2 py-6 text-sm text-[#a0a0a0]">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#f5f5f5]">{category}</span>
      </nav>

      <div className="mb-10 pb-8 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-4 mb-3">
          <CategoryBadge category={category} size="lg" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">{category}</h1>
        <p className="text-[#a0a0a0] text-lg max-w-2xl">{CATEGORY_DESCRIPTIONS[category]}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/category/${cat.toLowerCase()}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              cat === category
                ? "bg-[#e63946] text-white border-[#e63946]"
                : "bg-[#111111] text-[#a0a0a0] border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-white"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {articles.length > 0 ? (
        <>
          <p className="text-[#a0a0a0] text-sm mb-6">{articles.length} article{articles.length !== 1 ? "s" : ""} in {category}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">No articles yet in {category}</h2>
          <p className="text-[#a0a0a0] max-w-sm">Articles will appear after the next publication cycle at 7:00 AM MST.</p>
          <Link href="/" className="mt-6 text-[#e63946] hover:text-[#ff6b75] text-sm font-medium transition-colors">← Back to home</Link>
        </div>
      )}
    </div>
  );
}
