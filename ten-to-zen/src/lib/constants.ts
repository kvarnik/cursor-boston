export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
export const MESSAGE_MAX = 500;
export const TODO_MAX = 200;
export const MAX_ACTIVE_TODOS = 3;
export const MESSAGE_VISIBLE_DAYS = 14;
export const MESSAGE_PURGE_DAYS = 90;
export const DAILY_LIMIT_MS = 10 * 60 * 1000;
export const POLL_INTERVAL_MS = 60_000;

export const STORAGE_USERNAME = "ttz_username";
export const STORAGE_DAY_KEY = "ttz_day_key";
export const STORAGE_MS_USED = "ttz_ms_used_today";
export const STORAGE_LOCKED = "ttz_locked";
