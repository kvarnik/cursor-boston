/**
 * Copyright (C) 2026 Cursor Boston
 * SPDX-License-Identifier: GPL-3.0-only
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PM = path.join(ROOT, "pm");
const TASKS_DIR = path.join(PM, "tasks");
const STREAMS_MD = path.join(PM, "streams.md");

const STATUSES = new Set([
  "backlog",
  "ready",
  "in_progress",
  "review",
  "done",
]);

const REQUIRED = [
  "id",
  "title",
  "stream",
  "status",
  "assignee",
  "createdAt",
  "updatedAt",
];

function parseFrontmatterFile(raw, filePath) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) {
    console.error(`Missing frontmatter: ${filePath}`);
    return null;
  }
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
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
  return data;
}

function parseStreamsTable(md) {
  const lines = md.split(/\r?\n/);
  const ids = new Set();
  let sawHeader = false;
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith("|")) continue;
    const cells = t
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cells.length === 0) continue;
    if (cells[0].toLowerCase() === "order" && cells.includes("id")) {
      sawHeader = true;
      continue;
    }
    if (!sawHeader) continue;
    if (cells.every((c) => /^[-:\s]+$/.test(c))) continue;
    const order = Number(cells[0]);
    if (!Number.isFinite(order)) continue;
    ids.add(cells[1]);
  }
  return ids;
}

let failed = false;

const streamIds = parseStreamsTable(fs.readFileSync(STREAMS_MD, "utf8"));
const names = fs.readdirSync(TASKS_DIR).filter((n) => n.endsWith(".md"));

for (const name of names) {
  const fp = path.join(TASKS_DIR, name);
  const raw = fs.readFileSync(fp, "utf8");
  const data = parseFrontmatterFile(raw, fp);
  if (!data) {
    failed = true;
    continue;
  }
  for (const key of REQUIRED) {
    if (!data[key] || String(data[key]).trim() === "") {
      console.error(`${fp}: missing or empty "${key}"`);
      failed = true;
    }
  }
  if (!STATUSES.has(data.status)) {
    console.error(`${fp}: invalid status "${data.status}"`);
    failed = true;
  }
  if (!streamIds.has(data.stream)) {
    console.error(
      `${fp}: stream "${data.stream}" not in pm/streams.md table`
    );
    failed = true;
  }
  if (data.status === "done") {
    if (!data.completedBy || !data.completedAt) {
      console.error(
        `${fp}: status done requires completedBy and completedAt`
      );
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`pm:validate OK (${names.length} tasks)`);
