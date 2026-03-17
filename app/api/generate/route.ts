import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyArticleWithGrok } from "@/lib/fetchGrokNews";
import { insertArticle, articleExistsForToday } from "@/lib/supabase";
import type { Article, ArticleCategory } from "@/types/article";
import { CATEGORIES } from "@/types/article";
import slugify from "slugify";

/**
 * POST /api/generate
 *
 * Called by Vercel Cron every Wednesday at 14:00 UTC (7:00 AM MST).
 * Uses Grok's live X.com + web search to research and write the week's
 * top AI story for each of the 5 categories.
 *
 * Manual trigger:
 *   curl -X POST https://your-app.vercel.app/api/generate \
 *     -H "Authorization: Bearer <your-cron-secret>"
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[generate] CRON_SECRET not configured");
    return NextResponse.json(
      { error: "Server misconfiguration: CRON_SECRET not set" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if this week's edition was already generated today
  const force = req.nextUrl.searchParams.get("force") === "true";
  const alreadyGenerated = await articleExistsForToday();
  if (alreadyGenerated && !force) {
    console.log("[generate] Edition already generated today — skipping.");
    return NextResponse.json(
      { message: "Edition already generated for today", skipped: true },
      { status: 200 }
    );
  }
  if (alreadyGenerated && force) {
    console.log("[generate] Force flag set — re-generating despite existing edition.");
  }

  console.log("[generate] Starting weekly edition generation via Grok...");
  const startTime = Date.now();

  const now = new Date().toISOString();
  const results: PromiseSettledResult<Omit<Article, "id" | "created_at">>[] = [];
  for (const category of CATEGORIES) {
    results.push(await Promise.race([
      generateArticle(category, now).then(
        (v) => ({ status: "fulfilled" as const, value: v }),
        (e) => ({ status: "rejected" as const, reason: e })
      ),
    ]));
  }

  const successful = results
    .filter(
      (r): r is PromiseFulfilledResult<Omit<Article, "id" | "created_at">> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(
      `[generate] ${failed.length} article(s) failed:`,
      failed.map((r) => (r as PromiseRejectedResult).reason?.message ?? r)
    );
  }

  if (successful.length === 0) {
    return NextResponse.json(
      { error: "All article generations failed" },
      { status: 500 }
    );
  }

  console.log(
    `[generate] Generated ${successful.length} articles. Inserting into Supabase...`
  );

  const insertResults = await Promise.allSettled(
    successful.map((article) => insertArticle(article))
  );

  const inserted = insertResults.filter((r) => r.status === "fulfilled");
  const insertFailed = insertResults.filter((r) => r.status === "rejected");

  if (insertFailed.length > 0) {
    console.error(
      "[generate] Some inserts failed:",
      insertFailed.map((r) => (r as PromiseRejectedResult).reason)
    );
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `[generate] Done. ${inserted.length}/${successful.length} inserted in ${duration}s.`
  );

  return NextResponse.json(
    {
      success: true,
      articlesGenerated: successful.length,
      articlesInserted: inserted.length,
      failedGenerations: failed.length,
      failedInserts: insertFailed.length,
      durationSeconds: parseFloat(duration),
      titles: inserted.map(
        (r) => (r as PromiseFulfilledResult<Article>).value.title
      ),
    },
    { status: 200 }
  );
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    status: "ok",
    message:
      "The BYU AI Chronicle generation endpoint. POST to trigger weekly edition generation.",
    schedule: "Every Wednesday at 0 14 * * 3 UTC (7:00 AM MST)",
    model: "grok-3-latest with live X.com + web search",
  });
}

/** Generate and format a single article for a category */
async function generateArticle(
  category: ArticleCategory,
  publishedAt: string
): Promise<Omit<Article, "id" | "created_at">> {
  console.log(`[generate] Researching "${category}" via Grok...`);
  const result = await generateWeeklyArticleWithGrok(category);

  const slug = generateUniqueSlug(result.title, category);
  const readingTime = estimateReadingTime(result.content);

  console.log(`[generate] ✓ "${category}": "${result.title}"`);

  return {
    title: result.title,
    slug,
    summary: result.summary,
    content: result.content,
    category,
    image_url: result.image_url ?? null,
    source_urls: result.source_urls,
    author: "The BYU AI Chronicle Editorial",
    reading_time: readingTime,
    published_at: publishedAt,
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
