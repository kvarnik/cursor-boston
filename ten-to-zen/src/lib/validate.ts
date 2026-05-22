import {
  MESSAGE_MAX,
  TODO_MAX,
  USERNAME_MAX,
  USERNAME_MIN,
  USERNAME_RE,
} from "./constants";

export function validateUsername(
  value: string
): { ok: true; username: string } | { ok: false; error: string } {
  const username = value.trim();
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return {
      ok: false,
      error: `Username must be ${USERNAME_MIN}–${USERNAME_MAX} characters.`,
    };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      error: "Username may only use letters, numbers, and underscores.",
    };
  }
  return { ok: true, username };
}

export function validateMessage(
  value: string
): { ok: true; body: string } | { ok: false; error: string } {
  const body = value.trim();
  if (!body) return { ok: false, error: "Message cannot be empty." };
  if (body.length > MESSAGE_MAX) {
    return { ok: false, error: `Message must be at most ${MESSAGE_MAX} characters.` };
  }
  return { ok: true, body };
}

export function validateTodoBody(
  value: string
): { ok: true; body: string } | { ok: false; error: string } {
  const body = value.trim();
  if (!body) return { ok: false, error: "Todo cannot be empty." };
  if (body.length > TODO_MAX) {
    return { ok: false, error: `Todo must be at most ${TODO_MAX} characters.` };
  }
  return { ok: true, body };
}
