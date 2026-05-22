import { neon } from "@neondatabase/serverless";
import {
  MAX_ACTIVE_TODOS,
  MESSAGE_PURGE_DAYS,
  MESSAGE_VISIBLE_DAYS,
} from "./constants";
import { devStore } from "./dev-store";
import type { Message, Todo, TodosResponse } from "./types";

function databaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING
  );
}

const usePostgres = Boolean(databaseUrl());

let schemaReady: Promise<void> | null = null;

function getSql() {
  const url = databaseUrl();
  if (!url) throw new Error("Database URL is not configured.");
  return neon(url);
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export function isUsingPostgres(): boolean {
  return usePostgres;
}

async function ensureSchemaPostgres(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL REFERENCES users(username),
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS todos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL REFERENCES users(username),
      body TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      completed_at TIMESTAMPTZ
    )
  `;
}

export async function ensureSchema(): Promise<void> {
  if (!usePostgres) return;
  if (!schemaReady) {
    schemaReady = ensureSchemaPostgres();
  }
  await schemaReady;
}

export async function registerUsername(
  username: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = username.trim();

  if (!usePostgres) {
    if (devStore.hasUser(normalized)) {
      return { ok: false, error: "Username is already taken." };
    }
    devStore.addUser(normalized);
    return { ok: true };
  }

  await ensureSchema();
  const sql = getSql();
  try {
    await sql`
      INSERT INTO users (username) VALUES (${normalized})
    `;
    return { ok: true };
  } catch {
    return { ok: false, error: "Username is already taken." };
  }
}

export async function checkUsername(
  username: string
): Promise<{ available: boolean }> {
  const normalized = username.trim();

  if (!usePostgres) {
    return { available: !devStore.hasUser(normalized) };
  }

  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT username FROM users WHERE LOWER(username) = LOWER(${normalized})
  `;
  return { available: rows.length === 0 };
}

export async function listMessages(): Promise<Message[]> {
  const visibleSince = daysAgo(MESSAGE_VISIBLE_DAYS);
  const purgeBefore = daysAgo(MESSAGE_PURGE_DAYS);

  if (!usePostgres) {
    return devStore.getMessages(visibleSince, purgeBefore);
  }

  await ensureSchema();
  const sql = getSql();
  await sql`
    DELETE FROM messages WHERE created_at < ${purgeBefore.toISOString()}
  `;
  const rows = await sql`
    SELECT id::text, username, body, created_at
    FROM messages
    WHERE created_at >= ${visibleSince.toISOString()}
    ORDER BY created_at ASC
  `;
  return rows.map((r) => ({
    id: r.id as string,
    username: r.username as string,
    body: r.body as string,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

export async function createMessage(
  username: string,
  body: string
): Promise<Message> {
  if (!usePostgres) {
    return devStore.addMessage(username, body);
  }

  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO messages (username, body)
    VALUES (${username}, ${body})
    RETURNING id::text, username, body, created_at
  `;
  const r = rows[0];
  return {
    id: r.id as string,
    username: r.username as string,
    body: r.body as string,
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

export async function listTodos(username: string): Promise<TodosResponse> {
  if (!usePostgres) {
    return devStore.getTodos(username);
  }

  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id::text, username, body, status, created_at, completed_at
    FROM todos
    WHERE LOWER(username) = LOWER(${username})
    ORDER BY created_at ASC
  `;
  const todos: Todo[] = rows.map((r) => ({
    id: r.id as string,
    username: r.username as string,
    body: r.body as string,
    status: r.status as "active" | "archived",
    createdAt: new Date(r.created_at as string).toISOString(),
    completedAt: r.completed_at
      ? new Date(r.completed_at as string).toISOString()
      : null,
  }));
  return {
    active: todos.filter((t) => t.status === "active"),
    archived: todos
      .filter((t) => t.status === "archived")
      .sort(
        (a, b) =>
          new Date(b.completedAt ?? b.createdAt).getTime() -
          new Date(a.completedAt ?? a.createdAt).getTime()
      ),
  };
}

export async function createTodo(
  username: string,
  body: string
): Promise<{ ok: true; todo: Todo } | { ok: false; error: string }> {
  if (!usePostgres) {
    if (devStore.countActive(username) >= MAX_ACTIVE_TODOS) {
      return {
        ok: false,
        error: `You can only have ${MAX_ACTIVE_TODOS} active todos.`,
      };
    }
    return { ok: true, todo: devStore.addTodo(username, body) };
  }

  await ensureSchema();
  const sql = getSql();
  const countRows = await sql`
    SELECT COUNT(*)::int AS n FROM todos
    WHERE LOWER(username) = LOWER(${username}) AND status = 'active'
  `;
  const count = countRows[0]?.n as number;
  if (count >= MAX_ACTIVE_TODOS) {
    return {
      ok: false,
      error: `You can only have ${MAX_ACTIVE_TODOS} active todos.`,
    };
  }

  const rows = await sql`
    INSERT INTO todos (username, body, status)
    VALUES (${username}, ${body}, 'active')
    RETURNING id::text, username, body, status, created_at, completed_at
  `;
  const r = rows[0];
  return {
    ok: true,
    todo: {
      id: r.id as string,
      username: r.username as string,
      body: r.body as string,
      status: "active",
      createdAt: new Date(r.created_at as string).toISOString(),
      completedAt: null,
    },
  };
}

export async function archiveTodo(
  id: string,
  username: string
): Promise<{ ok: true; todo: Todo } | { ok: false; error: string }> {
  if (!usePostgres) {
    const todo = devStore.archiveTodo(id, username);
    if (!todo) return { ok: false, error: "Todo not found." };
    return { ok: true, todo };
  }

  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    UPDATE todos
    SET status = 'archived', completed_at = now()
    WHERE id = ${id}::uuid
      AND LOWER(username) = LOWER(${username})
      AND status = 'active'
    RETURNING id::text, username, body, status, created_at, completed_at
  `;
  if (rows.length === 0) {
    return { ok: false, error: "Todo not found." };
  }
  const r = rows[0];
  return {
    ok: true,
    todo: {
      id: r.id as string,
      username: r.username as string,
      body: r.body as string,
      status: "archived",
      createdAt: new Date(r.created_at as string).toISOString(),
      completedAt: new Date(r.completed_at as string).toISOString(),
    },
  };
}
