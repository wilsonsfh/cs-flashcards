# CS Flashcards

A personal spaced repetition flashcard app for mastering computer science fundamentals. Built with modern web technologies and powered by the FSRS algorithm.

Seeded with 1,792 cards from [jwasham/computer-science-flash-cards](https://github.com/jwasham/computer-science-flash-cards) — the companion to the famous [Coding Interview University](https://github.com/jwasham/coding-interview-university) study plan.

## Live Demo

**[cs-flashcards-ruby.vercel.app](https://cs-flashcards-ruby.vercel.app)**

Sign in with your email (magic link) → study due cards → rate each card (Again / Hard / Good / Easy) → come back daily.
Cards from [Coding Interview University](https://github.com/jwasham/coding-interview-university), scheduled by the FSRS spaced repetition algorithm.

## Why This Exists

### The Forgetting Curve Problem

Hermann Ebbinghaus demonstrated in 1885 — and [Murre & Dros replicated in 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4492928/) — that without review:

- **~50%** of new information is forgotten within **1 hour**
- **~70%** is forgotten within **24 hours**
- **~90%** is forgotten within **1 week**

This means studying algorithms in one cramming session leaves you retaining roughly 10% by the time you walk into an interview.

### Spaced Repetition Works

[Cepeda et al. (2006)](https://pubmed.ncbi.nlm.nih.gov/16719566/) analyzed **317 experiments across 184 studies** and found consistent superiority of distributed practice. The numbers:

- Spaced learners retained **82%** of material vs **27%** for crammers at long-term follow-up — a **3x advantage**
- Spaced repetition produces **200-300% better results** while requiring **30-40% less total time**

[Dunlosky et al. (2013)](https://journals.sagepub.com/doi/abs/10.1177/1529100612453266) reviewed 10 common study techniques and rated only **two** as "high utility": **practice testing** (active recall) and **distributed practice** (spaced repetition). Highlighting, rereading, and summarization were all rated low utility.

[Roediger & Karpicke (2006)](https://pubmed.ncbi.nlm.nih.gov/16507066/) proved that students who **tested themselves** dramatically outperformed those who **re-read** material on delayed assessments. [Karpicke & Roediger (2008)](https://pubmed.ncbi.nlm.nih.gov/18276894/) in *Science*: "Repeated testing — but not repeated studying — had large effects on long-term learning."

### The Study Philosophy

> **Do coding interview questions while you're learning, not after.**

Once you've learned a topic and feel somewhat comfortable with it (e.g., linked lists):
1. Open a coding interview resource
2. Do 2-3 problems on linked lists
3. Move on to the next learning topic
4. Later, come back and do another 2-3 linked list problems
5. Repeat with each new topic

You're not being hired for knowledge, but how you **apply** the knowledge. Keep doing problems while you're learning all this stuff, not after.

> Turn on some music without lyrics and you'll be able to focus pretty well.

*— [John Washam, Retaining Computer Science Knowledge](https://startupnextdoor.com/retaining-computer-science-knowledge/)*

### Why FSRS Over Simple Known/Unknown

The original flash cards app used a binary known/unknown system with random card selection — no scheduling algorithm. This rebuild uses [FSRS (Free Spaced Repetition Scheduler)](https://github.com/open-spaced-repetition/ts-fsrs), a modern ML-based algorithm that:

- Models **Difficulty**, **Stability**, and **Retrievability** per card
- Adapts intervals to your personal learning patterns
- Outperforms SM-2 (Anki's default) by ~15% in retention benchmarks
- Is used by Anki (opt-in), Logseq, RemNote, and Mochi Cards

## Features

- **FSRS-powered spaced repetition** — Intelligent scheduling with Again/Hard/Good/Easy ratings and interval previews
- **3D card flip animation** — Smooth CSS perspective-based flip
- **Dashboard** — Due count, streak, mastery percentage, 30-day review history chart
- **Code syntax highlighting** — Cards with code answers are auto-highlighted (Python, JS, TS, Java, C++, SQL, Bash)
- **Card management** — Add, edit, delete, search, and filter cards by category
- **Dark/light mode** — System preference detection with manual toggle
- **PWA** — Installable on mobile, works from your home screen
- **Cross-device sync** — Supabase ensures your progress syncs everywhere
- **Single-user auth** — Magic link email login

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + API routes, largest ecosystem |
| UI | shadcn/ui + Tailwind CSS 4 | Accessible components, full customization |
| Database | Supabase (Postgres) | Auth + realtime + RLS, generous free tier |
| SRS | ts-fsrs | Best-in-class spaced repetition algorithm |
| PWA | @ducanh2912/next-pwa | Service worker + offline fallback |
| Charts | Recharts | Composable React charts |
| Highlighting | highlight.js | Tree-shaken, only languages you need |
| Deploy | Vercel | Zero-config Next.js hosting |

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/cs-flashcards.git
cd cs-flashcards
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run `supabase/migrations/001_schema.sql`
3. Enable email auth in Authentication > Providers

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase URL, anon key, and service role key from the Supabase dashboard (Settings > API).

### 4. Migrate flash cards data

Download `cards-jwasham-extreme.db` from the [original repo](https://github.com/jwasham/computer-science-flash-cards/blob/main/cards-jwasham-extreme.db), then:

```bash
# First, sign up in the app to create your user, then get your user ID from Supabase Auth dashboard
export MIGRATION_USER_ID=your-user-uuid
npx ts-node --esm scripts/migrate.ts ./cards-jwasham-extreme.db
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

1. Push to GitHub
2. Connect the repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy — the Vercel cron job (in `vercel.json`) will keep your Supabase project alive

## References

1. Ebbinghaus, H. (1885). *Uber das Gedachtnis*. Replicated: [Murre & Dros (2015), PMC4492928](https://pmc.ncbi.nlm.nih.gov/articles/PMC4492928/)
2. Cepeda, N. J. et al. (2006). Distributed practice in verbal recall tasks. [PubMed 16719566](https://pubmed.ncbi.nlm.nih.gov/16719566/)
3. Roediger, H. L. & Karpicke, J. D. (2006). Test-enhanced learning. [PubMed 16507066](https://pubmed.ncbi.nlm.nih.gov/16507066/)
4. Karpicke, J. D. & Roediger, H. L. (2008). The critical importance of retrieval for learning. *Science*. [PubMed 18276894](https://pubmed.ncbi.nlm.nih.gov/18276894/)
5. Dunlosky, J. et al. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest, 14*(1). [DOI](https://journals.sagepub.com/doi/abs/10.1177/1529100612453266)
6. Bahrick, H. P. et al. (1993). Maintenance of foreign language vocabulary and the spacing effect. *Psychological Science*. [DOI](https://journals.sagepub.com/doi/10.1111/j.1467-9280.1993.tb00571.x)

## Credits

- Card content: [jwasham/computer-science-flash-cards](https://github.com/jwasham/computer-science-flash-cards) (CC-BY-SA-4.0)
- Study methodology: [Retaining Computer Science Knowledge](https://startupnextdoor.com/retaining-computer-science-knowledge/) by John Washam
- FSRS algorithm: [Open Spaced Repetition](https://github.com/open-spaced-repetition)

## License

MIT
