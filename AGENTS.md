# PM tasks — agent checkout

1. Run `npm run pm:ls` — pick a task `id` (usually `ready` or `backlog`).
2. Open `pm/tasks/<id>.md`. Set `status: in_progress`, set `assignee` (your GitHub handle or `cursor-agent`), bump `updatedAt` (ISO-8601 UTC).
3. Do the work in the repo; use the task body for acceptance criteria.
4. When finished: `status: review` or `done`; for `done`, set `completedBy` + `completedAt` and bump `updatedAt`.

**Statuses:** `backlog` → `ready` → `in_progress` → `review` → `done`

**Workload:** `done` tasks count toward `completedBy` on the dashboard.

Details: [pm/README.md](pm/README.md)
