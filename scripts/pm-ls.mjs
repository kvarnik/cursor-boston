/**
 * Copyright (C) 2026 Cursor Boston
 * SPDX-License-Identifier: GPL-3.0-only
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TASKS_DIR = path.join(ROOT, "pm", "tasks");

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return null;
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

const names = fs.readdirSync(TASKS_DIR).filter((n) => n.endsWith(".md"));
for (const name of names.sort()) {
  const raw = fs.readFileSync(path.join(TASKS_DIR, name), "utf8");
  const data = parseFrontmatter(raw);
  if (!data) continue;
  const status = data.status ?? "";
  if (status === "done") continue;
  const id = data.id ?? name.replace(/\.md$/, "");
  const stream = data.stream ?? "";
  const title = data.title ?? id;
  process.stdout.write(`${id}\t${stream}\t${status}\t${title}\n`);
}
