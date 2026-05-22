"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_LOCKED, STORAGE_USERNAME } from "@/lib/constants";
import type { Todo } from "@/lib/types";
import { useDailyTimer } from "@/hooks/useDailyTimer";
import { WelcomeScreen } from "./WelcomeScreen";
import { Workspace } from "./Workspace";
import { ZenScreen } from "./ZenScreen";

type Screen = "loading" | "welcome" | "workspace" | "zen";

export function AppShell() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [username, setUsername] = useState<string | null>(null);
  const [unfinished, setUnfinished] = useState<Todo[]>([]);

  const goZen = useCallback(async (name: string) => {
    try {
      const res = await fetch(
        `/api/todos?username=${encodeURIComponent(name)}`
      );
      if (res.ok) {
        const data = await res.json();
        setUnfinished(data.active ?? []);
      }
    } catch {
      setUnfinished([]);
    }
    setScreen("zen");
  }, []);

  const handleLock = useCallback(() => {
    if (username) goZen(username);
  }, [username, goZen]);

  const { remainingMs, progress, locked } = useDailyTimer(handleLock);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_USERNAME);
    const isLocked = localStorage.getItem(STORAGE_LOCKED) === "true";
    if (stored) {
      setUsername(stored);
      if (isLocked || locked) {
        goZen(stored);
      } else {
        setScreen("workspace");
      }
    } else {
      setScreen("welcome");
    }
  }, [goZen, locked]);

  useEffect(() => {
    if (locked && username && screen === "workspace") {
      goZen(username);
    }
  }, [locked, username, screen, goZen]);

  useEffect(() => {
    if (!locked && screen === "zen" && username) {
      setScreen("workspace");
    }
  }, [locked, screen, username]);

  function handleWelcomeReady(name: string) {
    localStorage.setItem(STORAGE_USERNAME, name);
    setUsername(name);
    setScreen("workspace");
  }

  if (screen === "loading") {
    return (
      <div className="screen loading-screen">
        <p>Breathing in…</p>
      </div>
    );
  }

  if (screen === "welcome") {
    return <WelcomeScreen onReady={handleWelcomeReady} />;
  }

  if (screen === "zen" && username) {
    return <ZenScreen username={username} unfinished={unfinished} />;
  }

  if (screen === "workspace" && username && !locked) {
    return (
      <Workspace
        username={username}
        remainingMs={remainingMs}
        progress={progress}
        onLock={() => goZen(username)}
      />
    );
  }

  return (
    <div className="screen loading-screen">
      <p>Preparing…</p>
    </div>
  );
}
