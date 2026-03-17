import { getArticlesByCategory } from "@/lib/supabase";
import {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  type ArticleCategory,
} from "@/types/article";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import CategoryBadge from "@/components/CategoryBadge";

interface PageProps {
  params: { category: string };
}

function resolveCategory(param: string): ArticleCategory | null {
  const normalized =
    param.charAt(0).toUpperCase() + param.slice(1).toLowerCase();
  return CATEGORIES.includes(normalized as ArticleCategory)
    ? (normalized as ArticleCategory)
    : null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const category = resolveCategory(params.category);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category} — The BYU AI Chronicle`,
    description: CATEGORY_DESCRIPTIONS[category],
  };
}

export const revalidate = 3600;

export default async function CategoryPage({ params }: PageProps) {
  const category = resolveCategory(params.category);
  if (!category) notFound();

  const articles = await getArticlesByCategory(category, 30);

  return (
    <div className="bg-bg-dark min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 py-6 text-sm text-slate-500 font-sans">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-slate-200">{category}</span>
        </nav>

        {/* Section header */}
        <div className="pb-8 border-b border-slate-800 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CategoryBadge category={category} size="lg" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-white mb-3">
            {category}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl font-sans italic">
            {CATEGORY_DESCRIPTIONS[category]}
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10 font-sans">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/category/${cat.toLowerCase()}`}
              className={`px-4 py-1.5 text-sm font-semibold transition-all border rounded ${
                cat === category
                  ? "bg-primary text-white border-primary"
                  : "text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {articles.length > 0 ? (
          <>
            <p className="text-slate-500 text-sm mb-6 font-sans">
              {articles.length} article{articles.length !== 1 ? "s" : ""} in{" "}
              {category}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-slate-800 border border-slate-800">
              {articles.map((article) => (
                <div key={article.id} className="bg-bg-dark">
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">
              No articles yet in {category}
            </h2>
            <p className="text-slate-400 max-w-sm text-sm font-sans">
              Articles will appear after the next Wednesday publication.
            </p>
            <Link
              href="/"
              className="mt-6 text-byu-tan hover:underline text-sm font-semibold transition-colors font-sans"
            >
              ← Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
