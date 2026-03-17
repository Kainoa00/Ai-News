import { getLatestArticles } from "@/lib/supabase";
import ArticleCard from "@/components/ArticleCard";
import CategoryBadge from "@/components/CategoryBadge";
import { CATEGORIES, CATEGORY_DESCRIPTIONS } from "@/types/article";
import Link from "next/link";
import Image from "next/image";
import { format, startOfWeek, endOfWeek } from "date-fns";
import type { Article } from "@/types/article";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allArticles = await getLatestArticles(30);

  const editionArticles = allArticles.slice(0, 5);
  const heroArticle = editionArticles[0];
  const secondaryArticles = editionArticles.slice(1, 3);
  const tertiaryArticles = editionArticles.slice(3);
  const pastArticles = allArticles.slice(5, 21);

  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  const editionDate = heroArticle ? new Date(heroArticle.published_at) : new Date();
  const weekStart = format(startOfWeek(editionDate, { weekStartsOn: 0 }), "MMMM d");
  const weekEnd = format(endOfWeek(editionDate, { weekStartsOn: 0 }), "MMMM d, yyyy");

  return (
    <div className="bg-bg-dark min-h-screen">

      {/* ── Top date bar ──────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-surface-dark">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-2 flex items-center justify-between">
          <p className="text-slate-400 text-xs font-sans tracking-wider uppercase">{today}</p>
          <p className="text-slate-500 text-xs font-sans hidden sm:block">
            {editionArticles.length > 0
              ? `Week of ${weekStart} – ${weekEnd}`
              : "Published every Wednesday at 7:00 AM MST"}
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">

        {/* ── Masthead ───────────────────────────────────────────────── */}
        <div className="py-6 text-center border-b border-slate-800">
          <p className="text-byu-tan text-xs font-bold uppercase tracking-[0.3em] font-sans mb-1.5">
            Weekly Edition
          </p>
          <h2 className="text-slate-300 text-sm font-sans tracking-widest uppercase">
            Artificial Intelligence · Published Every Wednesday
          </h2>
          <p className="text-slate-600 text-xs font-sans mt-2 italic">
            Spiritually strengthening · Intellectually enlarging · Character building · Service oriented
          </p>
        </div>

        {heroArticle ? (
          <>
            {/* ── Edition header ──────────────────────────────────────── */}
            <div className="mt-8 mb-5 flex items-end justify-between border-b border-slate-700 pb-3">
              <div>
                <p className="text-byu-tan text-xs font-bold uppercase tracking-[0.25em] font-sans mb-0.5">
                  This Week&apos;s Edition
                </p>
                <h2 className="text-white text-xl sm:text-2xl font-black font-display">
                  Week of {weekStart} – {weekEnd}
                </h2>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-sans font-semibold mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live from X.com · {editionArticles.length} articles
              </span>
            </div>

            {/* ── Main front-page grid ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-slate-800">

              {/* Hero — spans 2 cols */}
              <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-slate-800">
                <HeroBlock article={heroArticle} />
              </div>

              {/* Secondary — 1 col, stacked */}
              <div className="flex flex-col divide-y divide-slate-800">
                {secondaryArticles.map((article) => (
                  <SecondaryBlock key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* ── More from this edition ───────────────────────────────── */}
            {tertiaryArticles.length > 0 && (
              <section className="mt-10" id="editions">
                <SectionDivider label="More From This Edition" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-800 border border-slate-800">
                  {tertiaryArticles.map((article) => (
                    <div key={article.id} className="bg-bg-dark">
                      <ArticleCard article={article} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <EmptyState />
        )}

        {/* ── Browse by Section ─────────────────────────────────────── */}
        <section className="mt-12">
          <SectionDivider label="Browse by Section" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-slate-800 border border-slate-800">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat.toLowerCase()}`}
                className="group flex flex-col p-5 bg-bg-dark hover:bg-slate-800/60 transition-colors"
              >
                <CategoryBadge category={cat} size="md" />
                <h3 className="mt-3 font-display text-sm font-bold text-slate-200 group-hover:text-white transition-colors leading-snug">
                  {cat}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 font-sans leading-relaxed line-clamp-2">
                  {CATEGORY_DESCRIPTIONS[cat]}
                </p>
                <span className="mt-3 text-xs text-byu-tan font-semibold font-sans group-hover:underline underline-offset-2">
                  Browse →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Past Editions ────────────────────────────────────────── */}
        {pastArticles.length > 0 && (
          <section className="mt-12 pb-20">
            <SectionDivider label="Past Editions" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-slate-800 border border-slate-800">
              {pastArticles.map((article) => (
                <div key={article.id} className="bg-bg-dark">
                  <ArticleCard article={article} compact />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ── Hero block ──────────────────────────────────────────────────────────── */
function HeroBlock({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group relative flex flex-col justify-end overflow-hidden bg-surface-dark"
      style={{ minHeight: 420 }}
    >
      {article.image_url ? (
        <>
          {/* Blurred background fill for letterboxed images */}
          <Image
            src={article.image_url}
            alt=""
            fill
            className="object-cover scale-110 blur-xl opacity-40"
            unoptimized
            aria-hidden
          />
          {/* Actual image — contain so charts/screenshots aren't cropped */}
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-contain group-hover:scale-[1.02] transition-transform duration-700"
            priority
            unoptimized
          />
          <div className="absolute inset-0 hero-overlay" />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #071828 0%, #0c2040 60%, #071828 100%)" }}
        />
      )}

      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      <div className="relative z-10 p-7 sm:p-9">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-byu-tan font-sans">Featured</span>
          <span className="text-slate-600">·</span>
          <CategoryBadge category={article.category} size="sm" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-white leading-tight mb-3"
          style={{ lineHeight: 1.1 }}>
          {article.title}
        </h1>
        <p className="text-slate-300 text-base italic font-display leading-relaxed mb-5 max-w-xl line-clamp-2">
          {article.summary}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-sans border-t border-slate-700/50 pt-4">
          <span className="font-medium text-slate-300">{article.author}</span>
          <span className="text-slate-600">·</span>
          <span>{format(new Date(article.published_at), "MMMM d, yyyy")}</span>
          <span className="text-slate-600">·</span>
          <span>{article.reading_time} min read</span>
          <span className="ml-auto text-byu-tan font-semibold group-hover:underline underline-offset-4">
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Secondary block ─────────────────────────────────────────────────────── */
function SecondaryBlock({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group flex flex-col p-6 hover:bg-slate-800/30 transition-colors flex-1"
    >
      <CategoryBadge category={article.category} size="sm" />
      <h2 className="font-display text-lg sm:text-xl font-bold text-slate-100 group-hover:text-white transition-colors leading-snug mt-3 mb-3">
        {article.title}
      </h2>
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 font-sans flex-1">
        {article.summary}
      </p>
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500 font-sans">
        <span>{format(new Date(article.published_at), "MMM d, yyyy")}</span>
        <span className="text-slate-700">·</span>
        <span>{article.reading_time} min read</span>
        <span className="ml-auto text-byu-tan font-semibold group-hover:underline underline-offset-2">Read →</span>
      </div>
    </Link>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-200 font-sans flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 border-t border-slate-700" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-40 text-center">
      <div className="w-14 h-14 rounded-full bg-surface-dark flex items-center justify-center mb-6 border border-slate-700">
        <svg className="w-7 h-7 text-byu-tan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-3 font-display">
        This week&apos;s edition is on its way
      </h2>
      <p className="text-slate-400 max-w-sm text-sm leading-relaxed font-sans">
        The BYU AI Chronicle publishes 5 articles every Wednesday at 7:00 AM MST.
      </p>
    </div>
  );
}
