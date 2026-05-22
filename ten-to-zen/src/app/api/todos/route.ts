import { NextResponse } from "next/server";
import { createTodo, listTodos } from "@/lib/db";
import { validateTodoBody, validateUsername } from "@/lib/validate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = validateUsername(searchParams.get("username") ?? "");
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const todos = await listTodos(parsed.username);
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const obj = body as Record<string, unknown>;
  const userParsed = validateUsername(String(obj.username ?? ""));
  if (!userParsed.ok) {
    return NextResponse.json({ error: userParsed.error }, { status: 400 });
  }
  const todoParsed = validateTodoBody(String(obj.body ?? ""));
  if (!todoParsed.ok) {
    return NextResponse.json({ error: todoParsed.error }, { status: 400 });
  }
  const result = await createTodo(userParsed.username, todoParsed.body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ todo: result.todo });
}
