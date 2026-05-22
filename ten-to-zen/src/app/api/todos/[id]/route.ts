import { NextResponse } from "next/server";
import { archiveTodo } from "@/lib/db";
import { validateUsername } from "@/lib/validate";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const obj = body as Record<string, unknown>;
  const parsed = validateUsername(String(obj.username ?? ""));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const result = await archiveTodo(id, parsed.username);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json({ todo: result.todo });
}
