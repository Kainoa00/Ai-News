import { NextRequest, NextResponse } from "next/server";
import { fetchAllCategoryNews } from "@/lib/fetchNews";
import { generateDailyArticles } from "@/lib/generateArticles";
import { insertArticle, articleExistsForToday } from "@/lib/supabase";
import type { Article } from "@/types/article";

/**
 * POST /api/generate
 * Called by Vercel Cron at 0 14 * * * (7:00 AM MST / 14:00 UTC).
 * Can also be triggered manually:
 *   curl -X POST https://your-app.vercel.app/api/generate \
 *     -H "Authorization: Bearer <your-cron-secret>"
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[generate] CRON_SECRET not set");
    return NextResponse.json({ error: "Server misconfiguration: CRON_SECRET not set" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alreadyGenerated = await articleExistsForToday();
  if (alreadyGenerated) {
    console.log("[generate] Articles already exist for today — skipping.");
    return NextResponse.json({ message: "Articles already generated for today", skipped: true }, { status: 200 });
  }

  console.log("[generate] Starting daily article generation pipeline...");
  const startTime = Date.now();

  try {
    console.log("[generate] Fetching news from NewsAPI...");
    const newsByCategory = await fetchAllCategoryNews();

    if (newsByCategory.length === 0) {
      return NextResponse.json({ error: "No news data returned from NewsAPI" }, { status: 502 });
    }

    console.log(`[generate] Fetched news for ${newsByCategory.length} categories.`);

    console.log("[generate] Generating articles with Claude...");
    const articles = await generateDailyArticles(newsByCategory);

    if (articles.length === 0) {
      return NextResponse.json({ error: "Article generation failed for all categories" }, { status: 500 });
    }

    console.log(`[generate] Generated ${articles.length} articles. Inserting into Supabase...`);
    const insertResults = await Promise.allSettled(
      articles.map((article) => insertArticle(article))
    );

    const inserted = insertResults.filter((r) => r.status === "fulfilled");
    const failed = insertResults.filter((r) => r.status === "rejected");

    if (failed.length > 0) {
      console.error("[generate] Some articles failed to insert:", failed.map((r) => (r as PromiseRejectedResult).reason));
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[generate] Done. ${inserted.length}/${articles.length} articles inserted in ${duration}s.`);

    return NextResponse.json(
      {
        success: true,
        articlesGenerated: articles.length,
        articlesInserted: inserted.length,
        failedInserts: failed.length,
        durationSeconds: parseFloat(duration),
        titles: inserted.map((r) => (r as PromiseFulfilledResult<Article>).value.title),
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`[generate] Pipeline failed after ${duration}s:`, error);
    return NextResponse.json({ error: "Article generation pipeline failed", message, durationSeconds: parseFloat(duration) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    status: "ok",
    message: "AI Pulse generation endpoint. POST to trigger article generation.",
    schedule: "Daily at 0 14 * * * UTC (7:00 AM MST)",
  });
}
