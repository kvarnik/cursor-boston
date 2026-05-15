# File-based PM (Markdown)

Source files under `pm/` feed a static dashboard in `pm-site/`. GitHub Actions builds and publishes to **GitHub Pages** (see `.github/workflows/pm-pages.yml`).

## Streams (`pm/streams.md`)

- One Markdown **table**: columns `order`, `id`, `title`, `color`.
- `id` is referenced from each task as `stream: <id>`.

## Tasks (`pm/tasks/TASK-xxxxx.md`)

- **Frontmatter** (between `---` lines): flat `key: value` lines only (no nested YAML).
- **Body**: Markdown — description, checklists, links. Keep metadata in frontmatter thin so agents skim with `npm run pm:ls` first.

| Field | Required | Notes |
| ----- | -------- | ----- |
| `id` | yes | Matches filename stem, e.g. `TASK-00001`. |
| `title` | yes | Short label on the board. |
| `stream` | yes | Must match a stream `id` from the table. |
| `status` | yes | One of: `backlog`, `ready`, `in_progress`, `review`, `done`. |
| `assignee` | yes | e.g. `unassigned`, GitHub handle, `cursor-agent`. |
| `points` | no | Defaults to `1` in the builder (workload). |
| `createdAt` | yes | ISO-8601 string. |
| `updatedAt` | yes | ISO-8601 string; bump when you change the task. |
| `completedBy` | when done | Set with `status: done`. |
| `completedAt` | when done | ISO-8601. |

## Workload panel

- Aggregates **done** tasks by `completedBy`. Missing `completedBy` → **unknown** in the UI.

## Commits

This repo requires [DCO sign-off](https://github.com/rogerSuperBuilderAlpha/cursor-boston/blob/develop/DCO.md). After editing `pm/` files:

```bash
git add pm/
git commit -s -m "pm: TASK-00001 update status"
```

Cohort submission PRs to `c1w1pm-submission` use the same flag, e.g. `git commit -s -m "submission: kvarnik c1w1pm placeholder"`.

## Scripts (repo root)

- `npm run pm:ls` — one line per non-done task (`id`, `stream`, `status`, `title`).
- `npm run pm:build` — writes `pm-site/public/data.json` and runs `vite build` in `pm-site/`.
- `npm run pm:validate` — required frontmatter keys + enum checks (CI).

## Local preview

```bash
npm run pm:dev
```

Opens Vite dev server with freshly generated `data.json` (defaults to site root `/`).

## GitHub Pages URL

After enabling **Actions** → **General** → **Pages** → source **GitHub Actions** on your fork, the site is typically:

`https://<your-github-handle>.github.io/cursor-boston/`

Replace `<your-github-handle>` in `content/summer-cohort/c1/w1-pm/submissions/<handle>.json` → `liveUrl` if your fork name differs (repo must stay `cursor-boston` for this path, or change `base` in `pm-site/vite.config.ts`).
