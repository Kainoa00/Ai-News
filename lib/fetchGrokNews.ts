/**
 * Grok-powered weekly news research — xAI Agent Tools API
 *
 * Uses POST /v1/responses with web_search + x_search tools.
 * Docs: https://docs.x.ai/docs/guides/tools/overview
 */

import type { ArticleCategory } from "@/types/article";

const GROK_API_BASE = "https://api.x.ai/v1/responses";
const GROK_MODEL = "grok-4-latest";

export interface GrokArticleResult {
  title: string;
  summary: string;
  content: string;
  image_url: string | null;
  source_urls: string[];
}

const CATEGORY_SEARCH_FOCUS: Record<ArticleCategory, string> = {
  Research:
    "AI research breakthroughs, machine learning papers, deep learning advances, neural network research, arXiv AI preprints trending this week",
  Products:
    "new AI products launched this week, AI tool releases, generative AI product announcements, AI startup launches",
  Policy:
    "AI regulation news, AI policy developments, AI safety legislation, AI governance, government AI announcements this week",
  Models:
    "new AI models released this week, LLM launches, GPT Claude Gemini Grok model updates, AI benchmark results, foundation model announcements",
  Applications:
    "real-world AI deployments this week, enterprise AI, AI in healthcare finance education, AI use case success stories",
};

const CATEGORY_WRITING_GUIDANCE: Record<ArticleCategory, string> = {
  Research:
    "Focus on the scientific methodology, key empirical findings, and potential downstream applications. Reference specific results, datasets, or benchmarks where possible.",
  Products:
    "Cover the product's positioning, target users, technical differentiators, pricing if known, and competitive landscape context.",
  Policy:
    "Analyze the regulatory implications, stakeholder dynamics, affected companies, and what this means for AI development in the affected jurisdictions.",
  Models:
    "Discuss architecture innovations, benchmark performance versus predecessors and competitors, capability improvements, and industry positioning.",
  Applications:
    "Highlight the specific use case, quantified impact where available, implementation challenges overcome, and broader industry implications.",
};

function getDateRange() {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  return {
    from_date: sevenDaysAgo.toISOString().split("T")[0],
    to_date: today.toISOString().split("T")[0],
  };
}

/** Validate that a URL looks like a real image link */
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    // Accept common image extensions or known image CDNs
    const imageExtensions = /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i;
    const imageCdns = /\b(images\.|img\.|media\.|cdn\.|static\.|photos\.|pbs\.twimg\.com|upload\.wikimedia\.org)/i;
    return imageExtensions.test(parsed.pathname) || imageCdns.test(url);
  } catch {
    return false;
  }
}

/** Extract the assistant text from the Responses API output array */
function extractText(data: Record<string, unknown>): string {
  // Try top-level output_text first (convenience field)
  if (typeof data.output_text === "string") return data.output_text;

  // Walk output array
  const output = data.output as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(output)) return "";

  for (const item of output) {
    if (item.type === "message") {
      const content = item.content as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(content)) continue;
      for (const block of content) {
        if (block.type === "output_text" && typeof block.text === "string") {
          return block.text;
        }
      }
    }
  }
  return "";
}

/** Pull citation URLs from output annotations */
function extractCitations(data: Record<string, unknown>): string[] {
  const urls: string[] = [];
  const output = data.output as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(output)) return urls;

  for (const item of output) {
    if (item.type === "message") {
      const content = item.content as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(content)) continue;
      for (const block of content) {
        const annotations = block.annotations as Array<Record<string, unknown>> | undefined;
        if (!Array.isArray(annotations)) continue;
        for (const ann of annotations) {
          if (typeof ann.url === "string") urls.push(ann.url);
        }
      }
    }
  }
  return urls;
}

export async function generateWeeklyArticleWithGrok(
  category: ArticleCategory
): Promise<GrokArticleResult> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("XAI_API_KEY environment variable is not set");

  const { from_date, to_date } = getDateRange();
  const searchFocus = CATEGORY_SEARCH_FOCUS[category];
  const writingGuidance = CATEGORY_WRITING_GUIDANCE[category];

  const systemPrompt = `You are a senior AI journalist for The BYU AI Chronicle, the official weekly AI intelligence publication of Brigham Young University — a university founded, supported, and guided by The Church of Jesus Christ of Latter-day Saints. All content you produce must fully reflect BYU's mission and values.

BYU's mission: "To assist individuals in their quest for perfection and eternal life" through education that is spiritually strengthening, intellectually enlarging, character building, and oriented toward lifelong learning and service.

━━━ CONTENT STANDARDS (NON-NEGOTIABLE) ━━━

TONE & LANGUAGE
- Write with honesty, precision, and intellectual integrity at all times
- Use professional, respectful language — absolutely no profanity, vulgarity, or crude expressions
- Maintain an uplifting, constructive tone that reflects well on BYU and its community
- Treat all individuals, institutions, and communities with dignity and respect

ACCURACY & HONESTY
- Every factual claim must be grounded in verified sources — never fabricate, invent, or misrepresent facts
- Do not create fictional quotes, statistics, or sources
- Do not use misleading headlines or deceptive framing
- Honesty is a theological obligation at BYU, not merely a style preference

PROHIBITED CONTENT — never reference approvingly or normalize:
- Alcohol, tobacco, coffee, tea, vaping, marijuana, or any substance use
- Sexual content of any kind; content contrary to the Law of Chastity
- Attacks on The Church of Jesus Christ of Latter-day Saints, its doctrine, or its leaders
- Content that undermines religious faith or portrays spiritual commitment negatively
- Morally relativistic framing without ethical resolution
- Disrespectful characterizations of any person, faith, or community

AI & TECHNOLOGY FRAMING
- Frame AI developments through the lens of human dignity, service to humanity, and ethical responsibility
- Acknowledge the moral dimensions of AI — its potential to uplift or harm individuals and communities
- Where relevant, connect AI's implications to BYU's four aims: spiritual strengthening, intellectual enlargement, character building, and service

WRITING CRAFT
- Factually precise and grounded in what you actually find via search
- Analytically sharp — go beyond summarizing, provide expert context and insight
- Written in flowing prose; no section headers inside the article body
- Calibrated for a technically sophisticated BYU audience (researchers, faculty, students, alumni)
- Lead with the single most significant insight, not a summary of events
- Use **bold** for key technical terms on their first use
- Length: 600–800 words
- Structure: Introduction (2 paragraphs) → Core Analysis (3–4 paragraphs) → Implications/Outlook (1–2 paragraphs)
- Do NOT include a byline, date, or publication name inside the article content itself`;

  const userPrompt = `Search X.com and the web for the most important and discussed stories about: ${searchFocus}

Find the single most significant development from the past 7 days. Then write one authoritative, in-depth article about it for our weekly edition.

Writing guidance for this category (${category}): ${writingGuidance}

After completing your research and writing, return ONLY a valid JSON object — no preamble, no markdown code fences — matching this exact schema:
{
  "title": "A sharp, specific, non-clickbait headline (max 90 characters)",
  "summary": "A 2-sentence executive summary conveying the core insight and why it matters (max 220 characters)",
  "content": "The full article in Markdown. 600-800 words. Use **bold** for key terms on first use. Paragraphs separated by blank lines. No section headers. No byline.",
  "image_url": "A single direct URL to a relevant, publicly accessible image you found during your search (must end in .jpg, .jpeg, .png, .webp, or be a direct image link from a news source or official organization). Return null if no suitable image was found.",
  "source_urls": ["url1", "url2", "url3"]
}`;

  const requestBody = {
    model: GROK_MODEL,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    tools: [
      { type: "web_search", enable_image_understanding: true },
      {
        type: "x_search",
        from_date,
        to_date,
        enable_image_understanding: true,
      },
    ],
    max_output_tokens: 2500,
    temperature: 0.4,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4 * 60 * 1000); // 4-minute timeout

  let response: Response;
  try {
    response = await fetch(GROK_API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error(`Grok API timed out after 4 minutes for category "${category}"`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Grok API error ${response.status} for category "${category}": ${errorText}`
    );
  }

  const data = (await response.json()) as Record<string, unknown>;
  const rawText = extractText(data);

  if (!rawText) {
    throw new Error(`Grok returned empty response for category "${category}"`);
  }

  // Strip markdown code fences if Grok wraps the JSON
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: GrokArticleResult;
  try {
    parsed = JSON.parse(cleaned) as GrokArticleResult;
  } catch {
    throw new Error(
      `Grok returned non-JSON for category "${category}". Raw: ${rawText.slice(0, 500)}`
    );
  }

  // Supplement source_urls with annotation citations
  const annotationCitations = extractCitations(data);
  if (
    annotationCitations.length > 0 &&
    (!parsed.source_urls || parsed.source_urls.length === 0)
  ) {
    parsed.source_urls = annotationCitations.slice(0, 5);
  }

  if (!Array.isArray(parsed.source_urls)) {
    parsed.source_urls = [];
  }

  // Validate image_url — must be a real http(s) URL
  if (parsed.image_url && !isValidImageUrl(parsed.image_url)) {
    parsed.image_url = null;
  }

  return parsed;
}
