import { NextResponse } from "next/server";
import { checkUsername, registerUsername } from "@/lib/db";
import { validateUsername } from "@/lib/validate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("q") ?? "";
  const parsed = validateUsername(raw);
  if (!parsed.ok) {
    return NextResponse.json({ available: false, error: parsed.error });
  }
  const result = await checkUsername(parsed.username);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const raw =
    typeof body === "object" && body && "username" in body
      ? String((body as { username: unknown }).username)
      : "";
  const parsed = validateUsername(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const result = await registerUsername(parsed.username);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json({ username: parsed.username });
}
