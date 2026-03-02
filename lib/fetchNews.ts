import type { RawNewsItem, ArticleCategory } from "@/types/article";

const NEWS_API_KEY = process.env.NEWS_API_KEY!;
const NEWS_API_BASE = "https://newsapi.org/v2/everything";

const CATEGORY_QUERIES: Record<ArticleCategory, string> = {
  Research:
    '("AI research" OR "machine learning paper" OR "deep learning" OR "neural network" OR "arXiv" OR "NeurIPS" OR "ICML")',
  Products:
    '("AI product" OR "AI tool launch" OR "AI platform" OR "generative AI" OR "AI startup" OR "AI release")',
  Policy:
    '("AI regulation" OR "AI policy" OR "AI safety" OR "AI governance" OR "EU AI Act" OR "AI legislation")',
  Models:
    '("large language model" OR "LLM" OR "GPT" OR "Claude" OR "Gemini" OR "foundation model" OR "model release" OR "benchmark")',
  Applications:
    '("AI in healthcare" OR "AI in finance" OR "AI deployment" OR "enterprise AI" OR "AI automation" OR "AI use case")',
};

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: RawNewsItem[];
}

async function fetchCategoryNews(
  category: ArticleCategory,
  pageSize = 5
): Promise<RawNewsItem[]> {
  const query = CATEGORY_QUERIES[category];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);

  const url = new URL(NEWS_API_BASE);
  url.searchParams.set("q", query);
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("from", yesterday.toISOString().split("T")[0]);
  url.searchParams.set(
    "sources",
    [
      "wired",
      "the-verge",
      "techcrunch",
      "ars-technica",
      "mit-technology-review",
      "hacker-news",
    ].join(",")
  );

  const res = await fetch(url.toString(), {
    headers: { "X-Api-Key": NEWS_API_KEY },
    next: { revalidate: 0 },
  });

  if (!res.ok) return fetchCategoryNewsFallback(category, pageSize);

  const json: NewsAPIResponse = await res.json();
  if (json.status !== "ok" || !json.articles.length) {
    return fetchCategoryNewsFallback(category, pageSize);
  }

  return deduplicateByDomain(
    json.articles.filter((a) => a.description && a.title)
  ).slice(0, 3);
}

async function fetchCategoryNewsFallback(
  category: ArticleCategory,
  pageSize = 5
): Promise<RawNewsItem[]> {
  const query = CATEGORY_QUERIES[category];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);

  const url = new URL(NEWS_API_BASE);
  url.searchParams.set("q", query);
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("from", yesterday.toISOString().split("T")[0]);

  const res = await fetch(url.toString(), {
    headers: { "X-Api-Key": NEWS_API_KEY },
    next: { revalidate: 0 },
  });

  if (!res.ok) return [];
  const json: NewsAPIResponse = await res.json();
  if (json.status !== "ok") return [];

  return deduplicateByDomain(
    json.articles.filter((a) => a.description && a.title)
  ).slice(0, 3);
}

function deduplicateByDomain(articles: RawNewsItem[]): RawNewsItem[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    try {
      const domain = new URL(article.url).hostname;
      if (seen.has(domain)) return false;
      seen.add(domain);
      return true;
    } catch {
      return true;
    }
  });
}

export interface NewsByCategory {
  category: ArticleCategory;
  items: RawNewsItem[];
}

export async function fetchAllCategoryNews(): Promise<NewsByCategory[]> {
  const categories: ArticleCategory[] = [
    "Research",
    "Products",
    "Policy",
    "Models",
    "Applications",
  ];

  const results = await Promise.allSettled(
    categories.map(async (cat) => ({
      category: cat,
      items: await fetchCategoryNews(cat),
    }))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<NewsByCategory> =>
        r.status === "fulfilled" && r.value.items.length > 0
    )
    .map((r) => r.value);
}

export function formatNewsContext(items: RawNewsItem[]): string {
  return items
    .map(
      (item, i) =>
        `[Source ${i + 1}] ${item.source.name} — "${item.title}"
Description: ${item.description ?? "N/A"}
URL: ${item.url}
Published: ${item.publishedAt}`
    )
    .join("\n\n");
}
