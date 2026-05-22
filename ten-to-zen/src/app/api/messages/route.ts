import { NextResponse } from "next/server";
import { createMessage, listMessages } from "@/lib/db";
import { validateMessage, validateUsername } from "@/lib/validate";

export async function GET() {
  const messages = await listMessages();
  return NextResponse.json({ messages });
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
  const msgParsed = validateMessage(String(obj.body ?? ""));
  if (!msgParsed.ok) {
    return NextResponse.json({ error: msgParsed.error }, { status: 400 });
  }
  const message = await createMessage(userParsed.username, msgParsed.body);
  return NextResponse.json({ message });
}
