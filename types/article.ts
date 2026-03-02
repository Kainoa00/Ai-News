export type ArticleCategory =
  | "Research"
  | "Products"
  | "Policy"
  | "Models"
  | "Applications";

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  image_url: string | null;
  source_urls: string[];
  author: string;
  reading_time: number;
  published_at: string;
  created_at: string;
}

export interface RawNewsItem {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  content: string | null;
}

export const CATEGORIES: ArticleCategory[] = [
  "Research",
  "Products",
  "Policy",
  "Models",
  "Applications",
];

export const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  Research: "bg-blue-600",
  Products: "bg-green-600",
  Policy: "bg-yellow-600",
  Models: "bg-purple-600",
  Applications: "bg-orange-600",
};

export const CATEGORY_DESCRIPTIONS: Record<ArticleCategory, string> = {
  Research: "Academic papers, breakthroughs, and scientific advances",
  Products: "New AI tools, platforms, and commercial releases",
  Policy: "Regulation, governance, and AI safety frameworks",
  Models: "Foundation model releases, benchmarks, and architecture updates",
  Applications: "Real-world AI deployments across industries",
};
