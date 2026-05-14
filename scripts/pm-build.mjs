/**
 * Copyright (C) 2026 Cursor Boston
 * SPDX-License-Identifier: GPL-3.0-only
 *
 * Build pm-site/public/data.json from pm/streams.md and pm/tasks/*.md
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PM = path.join(ROOT, "pm");
const TASKS_DIR = path.join(PM, "tasks");
const STREAMS_MD = path.join(PM, "streams.md");
const OUT = path.join(ROOT, "pm-site", "public", "data.json");

const STATUSES = ["backlog", "ready", "in_progress", "review", "done"];

function parseFrontmatterFile(raw, filePath) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) {
    throw new Error(`Missing --- frontmatter in ${filePath}`);
  }
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    data[key] = val;
  }
  return { data, body: m[2].trim() };
}

function parseStreamsTable(md) {
  const lines = md.split(/\r?\n/);
  const rows = [];
  let sawHeader = false;
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith("|")) continue;
    const cells = t
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cells.length === 0) continue;
    const first = cells[0].toLowerCase();
    if (first === "order" && cells.includes("id")) {
      sawHeader = true;
      continue;
    }
    if (!sawHeader) continue;
    if (cells.every((c) => /^[-:\s]+$/.test(c))) continue;
    const order = Number(cells[0]);
    if (!Number.isFinite(order)) continue;
    const id = cells[1];
    const title = cells[2] ?? id;
    const color = cells[3] ?? "#64748b";
    rows.push({ order, id, title, color });
  }
  rows.sort((a, b) => a.order - b.order);
  return rows;
}

function readTasks() {
  const names = fs.readdirSync(TASKS_DIR).filter((n) => n.endsWith(".md"));
  const tasks = [];
  for (const name of names.sort()) {
    const fp = path.join(TASKS_DIR, name);
    const raw = fs.readFileSync(fp, "utf8");
    const { data, body } = parseFrontmatterFile(raw, fp);
    const stem = name.replace(/\.md$/, "");
    tasks.push({
      file: name,
      stem,
      id: data.id ?? stem,
      title: data.title ?? stem,
      stream: data.stream ?? "",
      status: data.status ?? "backlog",
      assignee: data.assignee ?? "unassigned",
      points: data.points != null && data.points !== "" ? Number(data.points) : 1,
      createdAt: data.createdAt ?? "",
      updatedAt: data.updatedAt ?? "",
      completedBy: data.completedBy ?? "",
      completedAt: data.completedAt ?? "",
      bodyPreview: body.slice(0, 280),
    });
  }
  return tasks;
}

function main() {
  const streamsMd = fs.readFileSync(STREAMS_MD, "utf8");
  const streams = parseStreamsTable(streamsMd);
  const tasks = readTasks();
  const payload = {
    generatedAt: new Date().toISOString(),
    statuses: STATUSES,
    streams,
    tasks,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${OUT} (${tasks.length} tasks, ${streams.length} streams)`);
}

main();
