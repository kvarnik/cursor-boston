/**
 * Copyright (C) 2026 Cursor Boston
 * SPDX-License-Identifier: GPL-3.0-only
 */

import "./style.css";

interface Stream {
  order: number;
  id: string;
  title: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  stream: string;
  status: string;
  assignee: string;
  points: number;
  completedBy: string;
  completedAt: string;
}

interface BoardData {
  generatedAt: string;
  statuses: string[];
  streams: Stream[];
  tasks: Task[];
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function groupTasks(
  tasks: Task[],
  streams: Stream[],
  statuses: string[]
): Map<string, Map<string, Task[]>> {
  const m = new Map<string, Map<string, Task[]>>();
  for (const s of streams) {
    const inner = new Map<string, Task[]>();
    for (const st of statuses) inner.set(st, []);
    m.set(s.id, inner);
  }
  for (const t of tasks) {
    const inner = m.get(t.stream);
    if (!inner) continue;
    const arr = inner.get(t.status);
    if (!arr) continue;
    arr.push(t);
  }
  return m;
}

function workloadByCompleter(tasks: Task[]): { who: string; points: number; count: number }[] {
  const map = new Map<string, { points: number; count: number }>();
  for (const t of tasks) {
    if (t.status !== "done") continue;
    const who =
      t.completedBy && t.completedBy.trim() ? t.completedBy.trim() : "unknown";
    const cur = map.get(who) ?? { points: 0, count: 0 };
    cur.points += Number.isFinite(t.points) ? t.points : 1;
    cur.count += 1;
    map.set(who, cur);
  }
  return [...map.entries()]
    .map(([who, v]) => ({ who, points: v.points, count: v.count }))
    .sort((a, b) => b.points - a.points);
}

async function load(): Promise<BoardData> {
  const url = `${import.meta.env.BASE_URL}data.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return (await res.json()) as BoardData;
}

function render(data: BoardData): void {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  const { streams, statuses, tasks } = data;
  const grouped = groupTasks(tasks, streams, statuses);
  const workload = workloadByCompleter(tasks);
  const maxPts = workload.reduce((m, w) => Math.max(m, w.points), 1);

  const headCells = statuses
    .map(
      (st) =>
        `<div class="board-colhead">${esc(st.replace(/_/g, " "))}</div>`
    )
    .join("");

  const rows = streams
    .map((stream) => {
      const inner = grouped.get(stream.id)!;
      const cells = statuses
        .map((st) => {
          const list = inner.get(st) ?? [];
          const cards = list
            .map(
              (t) => `
            <div class="card">
              <strong>${esc(t.title)}</strong>
              <meta>${esc(t.id)} · ${esc(String(t.points))}pt · ${esc(t.assignee)}</meta>
            </div>`
            )
            .join("");
          return `<div class="cell">${cards}</div>`;
        })
        .join("");
      return `
        <div class="swim-label" style="border-left:4px solid ${esc(stream.color)}">
          <span class="lane-dot" style="background:${esc(stream.color)}"></span>
          ${esc(stream.title)}
        </div>
        ${cells}`;
    })
    .join("");

  const bars = workload
    .map((w) => {
      const pct = Math.round((w.points / maxPts) * 100);
      return `
      <div class="bar-row">
        <div class="bar-label"><span>${esc(w.who)}</span><span>${w.points} pts (${w.count})</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      </div>`;
    })
    .join("");

  app.innerHTML = `
    <header>
      <h1>Cohort PM board</h1>
      <p>Swim lanes = workstreams · columns = status · data built from <code>pm/</code> · ${esc(data.generatedAt)}</p>
    </header>
    <div class="layout">
      <div class="board-wrap">
        <div class="board" style="grid-template-columns: 9rem repeat(${statuses.length},minmax(6rem,1fr))">
          <div class="board-corner"></div>
          ${headCells}
          ${rows}
        </div>
      </div>
      <aside class="side">
        <h2>Done workload</h2>
        ${bars || "<p class=\"muted\">No completed tasks yet.</p>"}
      </aside>
    </div>
  `;
}

load()
  .then(render)
  .catch((e: unknown) => {
    const app = document.querySelector<HTMLDivElement>("#app")!;
    app.innerHTML = `<div class="error">${esc(e instanceof Error ? e.message : String(e))}</div>`;
  });
