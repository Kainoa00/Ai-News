import Anthropic from "@anthropic-ai/sdk";
import slugify from "slugify";
import type { Article, ArticleCategory } from "@/types/article";
import type { NewsByCategory } from "./fetchNews";
import { formatNewsContext } from "./fetchNews";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const CATEGORY_GUIDANCE: Record<ArticleCategory, string> = {
  Research:
    "Focus on the scientific significance, methodology novelty, and potential downstream applications. Reference specific findings when possible.",
  Products:
    "Cover the product's positioning, target users, technical differentiators, and competitive landscape context.",
  Policy:
    "Analyze the regulatory implications, stakeholder dynamics, and what this means for AI companies operating in the affected jurisdictions.",
  Models:
    "Discuss architecture, benchmark performance, capability improvements over predecessors, and industry positioning.",
  Applications:
    "Highlight the specific use case, quantified impact where available, implementation challenges, and broader industry implications.",
};

interface GeneratedArticleData {
  title: string;
  summary: string;
  content: string;
  image_url: string | null;
  source_urls: string[];
}

async function generateArticleForCategory(
  newsData: NewsByCategory
): Promise<GeneratedArticleData> {
  const { category, items } = newsData;
  const context = formatNewsContext(items);
  const sourceUrls = items.map((i) => i.url);
  const imageUrl = items.find((i) => i.urlToImage)?.urlToImage ?? null;

  const systemPrompt = `You are a senior AI journalist and analyst for AI Pulse, a premium daily AI intelligence publication. Your writing is read by founders, researchers, investors, and technical professionals. Your articles are factually grounded, analytically sharp, and free of hype.

Style guide:
- Lead with the most significant insight, not a summary of what happened
- Use precise technical language appropriate for an expert audience
- Integrate context and historical significance where relevant
- Length: 550–750 words
- Structure: Introduction (2 paragraphs) → Core Analysis (3–4 paragraphs) → Implications/Outlook (1–2 paragraphs)
- Do NOT use ### headers inside the article body — write in flowing prose only
- Do NOT include a byline, date, or "AI Pulse" branding in the content itself`;

  const userPrompt = `Write a single, cohesive article for the **${category}** category of AI Pulse, today's daily AI intelligence briefing.

Category guidance: ${CATEGORY_GUIDANCE[category]}

Use the following recent news sources as factual grounding. Synthesize across them where relevant — do not just summarize one source. The article should provide expert analysis beyond what any single source covers.

---
${context}
---

Return your response as valid JSON matching this exact schema:
{
  "title": "A sharp, specific, non-clickbait headline (max 90 characters)",
  "summary": "A 2-sentence executive summary that conveys the core insight and why it matters (max 200 characters)",
  "content": "The full article in Markdown format (550–750 words). Use **bold** for key terms on first use. Paragraphs separated by blank lines. No headers."
}

Return ONLY the JSON object. No preamble, no markdown code fences.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-5-20251101",
    max_tokens: 2048,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as {
    title: string;
    summary: string;
    content: string;
  };

  return {
    title: parsed.title,
    summary: parsed.summary,
    content: parsed.content,
    image_url: imageUrl,
    source_urls: sourceUrls,
  };
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 230;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / wordsPerMinute));
}

function generateUniqueSlug(title: string, category: ArticleCategory): string {
  const date = new Date().toISOString().split("T")[0];
  const base = slugify(title, { lower: true, strict: true, trim: true });
  const catSlug = category.toLowerCase();
  return `${date}-${catSlug}-${base}`.slice(0, 120);
}

export async function generateDailyArticles(
  newsByCategory: NewsByCategory[]
): Promise<Omit<Article, "id" | "created_at">[]> {
  const now = new Date().toISOString();

  const results = await Promise.allSettled(
    newsByCategory.map(async (newsData) => {
      const generated = await generateArticleForCategory(newsData);

      const article: Omit<Article, "id" | "created_at"> = {
        title: generated.title,
        slug: generateUniqueSlug(generated.title, newsData.category),
        summary: generated.summary,
        content: generated.content,
        category: newsData.category,
        image_url: generated.image_url,
        source_urls: generated.source_urls,
        author: "AI Pulse Editorial",
        reading_time: estimateReadingTime(generated.content),
        published_at: now,
      };

      return article;
    })
  );

  const successful = results
    .filter(
      (
        r
      ): r is PromiseFulfilledResult<Omit<Article, "id" | "created_at">> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(
      `[generateArticles] ${failed.length} article(s) failed:`,
      failed.map((r) => (r as PromiseRejectedResult).reason)
    );
  }

  return successful;
}
