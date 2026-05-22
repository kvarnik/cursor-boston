"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DAILY_LIMIT_MS,
  STORAGE_DAY_KEY,
  STORAGE_LOCKED,
  STORAGE_MS_USED,
} from "@/lib/constants";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readState(): { dayKey: string; msUsed: number; locked: boolean } {
  if (typeof window === "undefined") {
    return { dayKey: todayKey(), msUsed: 0, locked: false };
  }
  const dayKey = localStorage.getItem(STORAGE_DAY_KEY);
  const today = todayKey();
  if (dayKey !== today) {
    localStorage.setItem(STORAGE_DAY_KEY, today);
    localStorage.setItem(STORAGE_MS_USED, "0");
    localStorage.setItem(STORAGE_LOCKED, "false");
    return { dayKey: today, msUsed: 0, locked: false };
  }
  return {
    dayKey: today,
    msUsed: Number(localStorage.getItem(STORAGE_MS_USED) ?? "0"),
    locked: localStorage.getItem(STORAGE_LOCKED) === "true",
  };
}

function persist(msUsed: number, locked: boolean) {
  localStorage.setItem(STORAGE_MS_USED, String(msUsed));
  localStorage.setItem(STORAGE_LOCKED, locked ? "true" : "false");
}

export function useDailyTimer(onLock: () => void) {
  const [msUsed, setMsUsed] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const initial = readState();
    setMsUsed(initial.msUsed);
    setLocked(initial.locked);
    if (initial.locked) onLock();
  }, [onLock]);

  const adminReset = useCallback(() => {
    setMsUsed(0);
    setLocked(false);
    persist(0, false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "8") {
        adminReset();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [adminReset]);

  useEffect(() => {
    if (locked) return;

    let lastTick = Date.now();
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        lastTick = Date.now();
        return;
      }
      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;

      setMsUsed((prev) => {
        const next = prev + delta;
        if (next >= DAILY_LIMIT_MS) {
          setLocked(true);
          persist(DAILY_LIMIT_MS, true);
          onLock();
          return DAILY_LIMIT_MS;
        }
        persist(next, false);
        return next;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [locked, onLock]);

  const remainingMs = Math.max(0, DAILY_LIMIT_MS - msUsed);
  const progress = Math.min(1, msUsed / DAILY_LIMIT_MS);

  return { msUsed, locked, remainingMs, progress, adminReset };
}
