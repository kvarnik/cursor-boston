# Ten to Zen

**Cursor: Ten to Zen** — cohort comms board for [Cursor Boston](https://github.com/rogerSuperBuilderAlpha/cursor-boston) C1 Week 2.

> Intentional comms. Spend 10 minutes doing work. Enjoy the rest of your day.

## Features

- One global `#cohort-global` chat stream (polls every 60s)
- First-come username (stored in this browser)
- Up to 3 active todos; complete to archive (hidden panel)
- 10 minutes per local calendar day while the tab is visible
- Calming lockout screen with unfinished todos
- **Shift+8** — admin demo reset (cohort reviewers)

## Develop

```bash
cd ten-to-zen
npm install
npm run dev
```

Without `DATABASE_URL` / `POSTGRES_URL`, the app uses an in-memory dev store (fine for local UI; not shared across server instances).

## Deploy on Vercel

1. Import `kvarnik/cursor-boston` in Vercel.
2. Set **Root Directory** to `ten-to-zen`.
3. Add **Neon** (or Postgres) from Storage — Vercel sets `DATABASE_URL`.
4. Deploy. Tables are created on first API request.

```bash
cd ten-to-zen && npx vercel env pull .env.local
```

Optional: run `scripts/schema.sql` in the SQL console.

## Submission

- **Repo:** https://github.com/kvarnik/cursor-boston (`ten-to-zen/`)
- **Branch for cohort JSON:** `c1w2comms-submission` on upstream (PR with `content/summer-cohort/c1/w2-comms/submissions/kvarnik.json` only)
