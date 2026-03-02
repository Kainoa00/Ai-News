# AI Pulse — Daily AI Intelligence Blog

Fully automated AI news blog publishing 5 expert-written articles every morning at **7:00 AM MST**.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase · Vercel Cron · NewsAPI · Claude (Anthropic)

---

## Supabase SQL (run this first)

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Research','Products','Policy','Models','Applications')),
  image_url TEXT,
  source_urls TEXT[] DEFAULT '{}',
  author TEXT DEFAULT 'AI Pulse Editorial',
  reading_time INTEGER DEFAULT 5,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_slug ON articles(slug);
```

---

## Environment Variables

| Key | Where to get it |
|-----|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `NEWS_API_KEY` | newsapi.org → Register free |
| `CRON_SECRET` | Any random string (run: `openssl rand -hex 32`) |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel deployment URL |

---

## Manual trigger (seed first articles)

```powershell
$headers = @{ Authorization = "Bearer YOUR_CRON_SECRET" }
Invoke-RestMethod -Method POST -Uri "https://your-app.vercel.app/api/generate" -Headers $headers
```

Cron fires automatically at **14:00 UTC = 7:00 AM MST** daily via `vercel.json`.
