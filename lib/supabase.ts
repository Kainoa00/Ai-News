import { createClient } from "@supabase/supabase-js";
import type { Article, ArticleCategory } from "@/types/article";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = () =>
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

export async function getLatestArticles(limit = 10): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Supabase read error: ${error.message}`);
  return data ?? [];
}

export async function getTodaysArticles(): Promise<Article[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .gte("published_at", today.toISOString())
    .lt("published_at", tomorrow.toISOString())
    .order("published_at", { ascending: false });
  if (error) throw new Error(`Supabase read error: ${error.message}`);
  return data ?? [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getArticlesByCategory(
  category: ArticleCategory,
  limit = 20
): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Supabase read error: ${error.message}`);
  return data ?? [];
}

export async function getAllArticles(limit = 50): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Supabase read error: ${error.message}`);
  return data ?? [];
}

export async function insertArticle(
  article: Omit<Article, "id" | "created_at">
): Promise<Article> {
  const client = supabaseAdmin();
  const { data, error } = await client
    .from("articles")
    .insert(article)
    .select()
    .single();
  if (error) throw new Error(`Supabase insert error: ${error.message}`);
  return data;
}

export async function articleExistsForToday(): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabaseAdmin()
    .from("articles")
    .select("id", { count: "exact", head: true })
    .gte("published_at", today.toISOString());
  if (error) return false;
  return (count ?? 0) > 0;
}
