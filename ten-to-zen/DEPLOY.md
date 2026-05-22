# Deploy Ten to Zen (one-time)

## Option A — Vercel dashboard (recommended)

1. Open https://vercel.com/new/import?s=https://github.com/kvarnik/cursor-boston&rootDirectory=ten-to-zen
2. Sign in with GitHub if prompted.
3. **Root Directory:** `ten-to-zen`
4. **Storage → Create Database → Neon** (or Postgres). Connect to this project.
5. Deploy. Copy the production URL (e.g. `https://cursor-boston-xxx.vercel.app`).
6. Update `content/summer-cohort/c1/w2-comms/submissions/kvarnik.json` → `liveUrl`.
7. Open PR: https://github.com/rogerSuperBuilderAlpha/cursor-boston/compare/c1w2comms-submission...kvarnik:submit-kvarnik-w2comms

## Option B — GitHub Actions (after secrets)

Add repo secrets on `kvarnik/cursor-boston`:

| Secret | Where to get it |
|--------|-----------------|
| `VERCEL_TOKEN` | https://vercel.com/account/settings/tokens |
| `VERCEL_ORG_ID` | Project Settings → General |
| `VERCEL_PROJECT_ID` | Project Settings → General |
| `DATABASE_URL` | Vercel Storage → Neon → connection string |

Push to `feat/c1w2-ten-to-zen` runs `.github/workflows/deploy-ten-to-zen.yml`.

## Option C — CLI

```bash
cd ten-to-zen
npx vercel login
npx vercel link   # new project, root already in ten-to-zen
npx vercel env pull .env.local
npx vercel --prod
```
