import { getArticleBySlug, getLatestArticles } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import CategoryBadge from "@/components/CategoryBadge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Article } from "@/types/article";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
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
  const [article, recentArticles] = await Promise.all([
    getArticleBySlug(params.slug),
    getLatestArticles(12),
  ]);

  if (!article) notFound();

  const related = recentArticles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 3);

  const moreStories = recentArticles
    .filter((a) => a.slug !== article.slug && a.category !== article.category)
    .slice(0, 3);

  const publishedDate = new Date(article.published_at);

  return (
    <div className="bg-bg-dark min-h-screen">
      {/* Top accent bar */}
      <div className="h-[3px] bg-primary" />

      <div className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col lg:flex-row gap-16">
        {/* ── Main Article ──────────────────────────────────────────────── */}
        <article className="flex-1 max-w-[760px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8 text-sm text-slate-500 font-sans">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Home
            </Link>
            <span className="text-slate-700">/</span>
            <Link
              href={`/category/${article.category.toLowerCase()}`}
              className="hover:text-slate-300 transition-colors"
            >
              {article.category}
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {article.title}
            </span>
          </nav>

          {/* Category + section */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-byu-tan font-sans">
              {article.category}
            </span>
            <span className="text-slate-600">·</span>
            <CategoryBadge category={article.category} size="sm" />
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-[-0.025em] mb-5">
            {article.title}
          </h1>

          {/* Summary / deck */}
          <p className="font-display text-xl sm:text-2xl text-slate-400 italic leading-relaxed mb-8">
            {article.summary}
          </p>

          {/* Author + meta bar */}
          <div className="flex items-center justify-between border-y border-slate-800 py-4 font-sans text-sm mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                AI
              </div>
              <div>
                <p className="font-bold text-slate-100">{article.author}</p>
                <p className="text-slate-500 text-xs">
                  The BYU AI Chronicle
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <p className="text-slate-500 hidden sm:block">
                {format(publishedDate, "MMMM d, yyyy")}
              </p>
              <p className="text-slate-500 hidden sm:block">
                {article.reading_time} min read
              </p>
              <div className="flex gap-2">
                <ShareButton />
                <BookmarkButton />
              </div>
            </div>
          </div>

          {/* Hero image */}
          {article.image_url && (
            <figure className="mb-10">
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-900 rounded">
                {/* Blurred background for letterboxed images */}
                <Image
                  src={article.image_url}
                  alt=""
                  fill
                  className="object-cover scale-110 blur-xl opacity-30"
                  unoptimized
                  aria-hidden
                />
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
              <figcaption className="text-sm text-slate-500 font-sans mt-3 border-l-2 border-primary pl-3">
                {article.category} — {format(publishedDate, "MMMM d, yyyy")}
              </figcaption>
            </figure>
          )}

          {/* Article body */}
          <div className="article-content max-w-[72ch]">
            {/* First paragraph gets drop cap */}
            <ArticleBody content={article.content} />
          </div>

          {/* Sources */}
          {article.source_urls.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-sans">
                Sources
              </h3>
              <ul className="space-y-2">
                {article.source_urls.map((url, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-byu-tan hover:underline transition-colors break-all font-sans"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          <div className="mt-10 pt-8 border-t border-slate-800">
            <div className="flex flex-wrap gap-2 font-sans">
              {["#AI", `#${article.category}`, "#WeeklyEdition", "#BYUAIChronicle"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>
        </article>

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-[300px] xl:w-[320px] flex-shrink-0 font-sans space-y-10">
          {/* Related stories */}
          {related.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-100 border-b-2 border-slate-100 pb-2 mb-5">
                More in {article.category}
              </h3>
              <div className="space-y-5">
                {related.map((a) => (
                  <RelatedStoryCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          )}

          {/* More stories */}
          {moreStories.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-100 border-b-2 border-slate-100 pb-2 mb-5">
                Other Stories This Week
              </h3>
              <div className="space-y-5">
                {moreStories.map((a) => (
                  <RelatedStoryCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          )}

          {/* Newsletter subscribe */}
          <div className="bg-primary text-white p-6 rounded">
            <div className="text-3xl mb-3 text-blue-200">✉</div>
            <h3 className="text-lg font-bold mb-2 font-display">
              Never Miss an Edition
            </h3>
            <p className="text-sm text-blue-100 mb-4 leading-relaxed font-sans">
              Get the weekly AI Chronicle delivered to your inbox every
              Wednesday morning.
            </p>
            <input
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/50 mb-3 focus:outline-none focus:border-white/60 focus:ring-1 focus:ring-white/30 font-sans"
              placeholder="Your email address"
              type="email"
            />
            <button className="w-full bg-white text-primary font-bold text-sm py-2 rounded hover:bg-slate-100 transition-colors font-sans">
              Subscribe Now
            </button>
          </div>

          {/* BYU Editorial Standards */}
          <div className="bg-slate-800/50 p-5 border border-slate-700 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
              Editorial Standards
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              This article was generated by Grok AI using live search of X.com
              and the web, then reviewed against{" "}
              <a
                href="https://honorcode.byu.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-byu-tan hover:underline"
              >
                BYU Honor Code
              </a>{" "}
              standards.
            </p>
            <ul className="text-xs text-slate-500 font-sans space-y-1.5">
              {[
                "Factually accurate, verifiable sources",
                "No profanity or disrespectful language",
                "Aligned with BYU's mission & values",
                "Human dignity and ethical framing",
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="text-byu-tan mt-0.5 flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-600 font-sans pt-1 border-t border-slate-700">
              Part of the{" "}
              <Link href="/" className="hover:text-slate-400 transition-colors">
                {format(publishedDate, "'Week of' MMMM d, yyyy")}
              </Link>{" "}
              edition.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Split content into paragraphs; first paragraph gets drop-cap styling */
function ArticleBody({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/);

  if (paragraphs.length === 0) {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    );
  }

  const [first, ...rest] = paragraphs;

  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="drop-cap mb-6">{children}</p>
          ),
        }}
      >
        {first}
      </ReactMarkdown>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {rest.join("\n\n")}
      </ReactMarkdown>
    </>
  );
}

function RelatedStoryCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.slug}`} className="block group">
      <CategoryBadge category={article.category} size="sm" />
      <h4 className="mt-2 text-sm font-bold text-slate-300 group-hover:text-white transition-colors leading-snug font-display">
        {article.title}
      </h4>
      <p className="mt-1 text-xs text-slate-500">
        {format(new Date(article.published_at), "MMM d")} ·{" "}
        {article.reading_time} min read
      </p>
    </Link>
  );
}

function ShareButton() {
  return (
    <button className="w-9 h-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
    </button>
  );
}

function BookmarkButton() {
  return (
    <button className="w-9 h-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}
